from fastapi import APIRouter, HTTPException, status, Depends, Request
from jose import jwt, JWTError
from api.config import settings
from api.models.auth import (
    RegisterIntentRequest,
    RegisterIntentResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResendOtpRequest,
    ResendOtpResponse,
    LoginRequest,
    TokenResponse,
    UserOut,
)
from api.database import get_db_cursor
from api.services.auth_service import AuthService
from api.services.redis_service import RedisService
from api.services.email_service import EmailService
from api.dependencies import get_current_user

router = APIRouter(prefix="/api/py/auth", tags=["Authentication & Onboarding"])


@router.post(
    "/register-intent",
    response_model=RegisterIntentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Step 1: Initiate Client Registration & Dispatch OTP"
)
def register_intent(payload: RegisterIntentRequest):
    email = payload.email.lower().strip()
    phone = payload.phone_number.strip()
    password_hash = AuthService.hash_secret(payload.password)
    password_unhashed = payload.password

    with get_db_cursor() as cur:
        # Check if user already exists
        cur.execute("SELECT id, status, is_email_verified FROM users WHERE email = %s;", (email,))
        existing = cur.fetchone()

        if existing:
            if existing["status"] == "active":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An active account with this email address already exists. Please log in.",
                )
            # If already pending, update credentials so user can continue
            cur.execute(
                """
                UPDATE users
                SET password_hash = %s,
                    password_unhashed = %s,
                    phone_number = %s,
                    updated_at = NOW()
                WHERE id = %s;
                """,
                (password_hash, password_unhashed, phone, existing["id"])
            )
        else:
            # Check phone number uniqueness
            cur.execute("SELECT id FROM users WHERE phone_number = %s;", (phone,))
            if cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This phone number is already registered to another account.",
                )

            # Insert new user record
            cur.execute(
                """
                INSERT INTO users (
                    email,
                    password_hash,
                    password_unhashed,
                    phone_number,
                    role,
                    status,
                    is_email_verified,
                    is_phone_verified,
                    terms_accepted_at,
                    privacy_policy_accepted_at
                ) VALUES (%s, %s, %s, %s, 'customer', 'pending_verification', FALSE, FALSE, NOW(), NOW())
                RETURNING id;
                """,
                (email, password_hash, password_unhashed, phone)
            )

    # Generate 6-digit numerical OTP and store in Upstash Redis (300s TTL)
    otp_code = RedisService.generate_otp()
    RedisService.store_otp(email, otp_code, ttl_seconds=300)

    # Dispatch branded verification email via Resend
    try:
        EmailService.send_otp_email(recipient_email=email, otp_code=otp_code)
    except Exception as e:
        # Log error but don't crash
        print(f"[EmailService Warning] Failed to send email to {email}: {e}")

    return RegisterIntentResponse(
        status="pending_verification",
        message="A 6-digit verification code has been dispatched to your email address.",
        email=email,
        expires_in=300
    )


@router.post(
    "/verify-otp",
    response_model=VerifyOtpResponse,
    summary="Step 2: Validate 6-Digit Email Verification Code"
)
def verify_otp(payload: VerifyOtpRequest):
    email = payload.email.lower().strip()
    submitted_code = payload.otp_code.strip()

    # Validate against Redis
    is_valid = RedisService.verify_otp(email, submitted_code, delete_on_success=True)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check your email or request a new code.",
        )

    with get_db_cursor() as cur:
        cur.execute(
            """
            UPDATE users
            SET is_email_verified = TRUE,
                status = CASE WHEN status = 'pending_verification' THEN 'pending_kyc' ELSE status END,
                updated_at = NOW()
            WHERE email = %s
            RETURNING id, status;
            """,
            (email,)
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account record not found.",
            )

    # Issue Onboarding JWT (Valid for 24 Hours to complete KYC and PIN)
    onboarding_token = AuthService.create_jwt_token(
        user_id=str(user["id"]),
        email=email,
        scope="onboarding"
    )

    next_step = "kyc_profile" if user["status"] == "pending_kyc" else "dashboard"

    return VerifyOtpResponse(
        status="verified",
        onboarding_token=onboarding_token,
        token_type="bearer",
        next_step=next_step,
        message="Email successfully verified. You may now complete institutional KYC."
    )


@router.post(
    "/resend-otp",
    response_model=ResendOtpResponse,
    summary="Request a Fresh 6-Digit Verification Code"
)
def resend_otp(payload: ResendOtpRequest):
    email = payload.email.lower().strip()

    # Check rate limiting
    if RedisService.is_rate_limited(email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="A code was recently requested. Please wait 60 seconds before requesting another.",
        )

    with get_db_cursor() as cur:
        cur.execute("SELECT id, is_email_verified FROM users WHERE email = %s;", (email,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No registration intent found for this email address.",
            )
        if user["is_email_verified"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email address is already verified. Please proceed to login.",
            )

    # Generate and store new OTP
    otp_code = RedisService.generate_otp()
    RedisService.store_otp(email, otp_code, ttl_seconds=300)

    try:
        EmailService.send_otp_email(recipient_email=email, otp_code=otp_code)
    except Exception as e:
        print(f"[EmailService Warning] Failed to resend email to {email}: {e}")

    return ResendOtpResponse(
        status="resent",
        message="A fresh 6-digit security code has been sent to your inbox.",
        expires_in=300
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Client Login with Email & Password"
)
def login(payload: LoginRequest):
    email = payload.email.lower().strip()

    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT id, email, password_hash, phone_number, role, status,
                   profile_picture_url, is_email_verified, is_phone_verified, created_at
            FROM users
            WHERE email = %s;
            """,
            (email,)
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        # Verify password
        if not AuthService.verify_secret(payload.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        user_status = user["status"]

        # If incomplete onboarding, route accordingly
        if user_status == "pending_verification":
            # Dispatch fresh OTP
            otp_code = RedisService.generate_otp()
            RedisService.store_otp(email, otp_code, ttl_seconds=300)
            try:
                EmailService.send_otp_email(email, otp_code)
            except Exception:
                pass
            
            token = AuthService.create_jwt_token(str(user["id"]), email, scope="onboarding")
            return TokenResponse(
                access_token=token,
                status=user_status,
                next_step="otp_verification",
                user=UserOut(**dict(user))
            )

        if user_status in ["pending_kyc", "kyc_submitted"]:
            token = AuthService.create_jwt_token(str(user["id"]), email, scope="onboarding")
            next_step = "kyc_profile" if user_status == "pending_kyc" else "security_pin"
            return TokenResponse(
                access_token=token,
                status=user_status,
                next_step=next_step,
                user=UserOut(**dict(user))
            )

        # Full active session
        access_token = AuthService.create_jwt_token(
            user_id=str(user["id"]),
            email=email,
            scope="full_access"
        )

        return TokenResponse(
            access_token=access_token,
            status="active",
            next_step="dashboard",
            user=UserOut(**dict(user))
        )


@router.get(
    "/me",
    summary="Get Authenticated User Profile & Banking Context"
)
def get_me(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db_cursor() as cur:
        # Get primary account
        cur.execute(
            """
            SELECT id, account_number, routing_number, account_type, currency, balance, status, tier
            FROM accounts
            WHERE user_id = %s
            ORDER BY created_at ASC
            LIMIT 1;
            """,
            (user_id,)
        )
        account = cur.fetchone()

        # Get KYC status
        cur.execute(
            """
            SELECT first_name, last_name, kyc_status
            FROM kyc_profiles
            WHERE user_id = %s;
            """,
            (user_id,)
        )
        kyc = cur.fetchone()

    user_data = dict(current_user)
    # Transform raw avatar path to internal API endpoint
    pic = user_data.get("profile_picture_url")
    if pic and not pic.startswith("http") and not pic.startswith("/api/py/"):
        v = pic.split('_')[-1].split('.')[0] if '_' in pic else "1"
        user_data["profile_picture_url"] = f"/api/py/storage/avatars/{user_id}?v={v}"

    return {
        "user": user_data,
        "primary_account": dict(account) if account else None,
        "kyc": dict(kyc) if kyc else None,
    }


@router.post(
    "/refresh",
    summary="Refresh Active Session Token"
)
def refresh_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required for refresh."
        )

    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False}
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token."
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload."
        )

    with get_db_cursor() as cur:
        cur.execute("SELECT id, email, status FROM users WHERE id = %s;", (user_id,))
        user = cur.fetchone()
        if not user or user["status"] in ["suspended", "closed"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found."
            )

    new_token = AuthService.create_jwt_token(
        user_id=str(user["id"]),
        email=user["email"],
        scope=payload.get("scope", "full_access")
    )

    return {
        "access_token": new_token,
        "token_type": "bearer",
        "status": user["status"]
    }


@router.post(
    "/logout",
    summary="Client Session Logout"
)
def logout():
    return {
        "status": "logged_out",
        "message": "Session terminated successfully."
    }
