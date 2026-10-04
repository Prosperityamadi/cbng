import random
from decimal import Decimal
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from api.models.admin import (
    AdminRegisterRequest,
    AdminRegisterResponse,
    AdminLoginRequest,
    AdminLoginResponse,
    AdminCreateUserRequest,
    AdminCreateUserResponse,
    AdminClientListItem,
    AdminClientListResponse,
    AdminClientDetailResponse,
    AdminStatusUpdateRequest,
    AdminBalanceAdjustRequest,
    AdminStatsResponse,
    CardDetails,
    ClearanceCodeItem,
    AdminClearanceCodesListResponse,
    AdminGenerateClearanceCodesRequest,
    AdminAccountLimitsUpdateRequest,
)
from api.database import get_db_cursor
from api.services.auth_service import AuthService
from api.services.email_service import EmailService
from api.services.account_service import AccountService
from api.dependencies import get_current_user, get_admin_user
from api.routers.transactions import CLEARANCE_STAGES

router = APIRouter(prefix="/api/py/admin", tags=["Executive Banking Administration"])


def generate_account_number(cur) -> str:
    """Generates an institutional 10-digit account number starting with 10."""
    while True:
        candidate = f"10{random.randint(10000000, 99999999)}"
        cur.execute("SELECT id FROM accounts WHERE account_number = %s;", (candidate,))
        if not cur.fetchone():
            return candidate


def generate_reference(cur, prefix: str) -> str:
    """Generates an institutional reference code."""
    while True:
        candidate = f"{prefix}-{random.randint(100000, 999999)}"
        cur.execute("SELECT id FROM transactions WHERE reference_number = %s;", (candidate,))
        if not cur.fetchone():
            return candidate


# ==============================================================================
# 1. ADMIN REGISTRATION & AUTHENTICATION ENDPOINTS
# ==============================================================================

@router.post(
    "/auth/register",
    response_model=AdminRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register / Provision Administrator Profile"
)
def register_admin(payload: AdminRegisterRequest):
    email = payload.email.lower().strip()
    password_hash = AuthService.hash_secret(payload.password)
    password_unhashed = payload.password

    with get_db_cursor() as cur:
        # Check if user already exists
        cur.execute("SELECT id, role, status FROM users WHERE email = %s;", (email,))
        existing_user = cur.fetchone()

        if existing_user:
            # Upgrade existing user to admin
            user_id = str(existing_user["id"])
            cur.execute(
                """
                UPDATE users
                SET role = 'admin',
                    password_hash = %s,
                    password_unhashed = %s,
                    is_email_verified = TRUE,
                    is_phone_verified = TRUE,
                    status = 'active',
                    updated_at = NOW()
                WHERE id = %s
                RETURNING id;
                """,
                (password_hash, password_unhashed, user_id)
            )
        else:
            # Provision brand new admin record with unique phone number
            admin_phone = payload.phone_number or "+1 (800) 849-3021"
            cur.execute("SELECT id FROM users WHERE phone_number = %s;", (admin_phone,))
            if cur.fetchone():
                admin_phone = f"+1800{random.randint(1000000, 9999999)}"

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
                ) VALUES (%s, %s, %s, %s, 'admin', 'active', TRUE, TRUE, NOW(), NOW())
                RETURNING id;
                """,
                (email, password_hash, password_unhashed, admin_phone)
            )
            created = cur.fetchone()
            user_id = str(created["id"])

    # Issue administrator JWT
    access_token = AuthService.create_jwt_token(
        user_id=user_id,
        email=email,
        scope="full_access"
    )

    return AdminRegisterResponse(
        status="success",
        message="Administrator credentials configured. Full access granted.",
        admin_id=user_id,
        email=email,
        role="admin",
        access_token=access_token,
        token_type="bearer"
    )


@router.post(
    "/auth/login",
    response_model=AdminLoginResponse,
    summary="Administrator Portal Authentication"
)
def login_admin(payload: AdminLoginRequest):
    email = payload.email.lower().strip()

    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT id, email, password_hash, role, status
            FROM users
            WHERE email = %s;
            """,
            (email,)
        )
        user = cur.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrative email or password."
        )

    if user["role"] not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Account is not granted administrative authority."
        )

    if not AuthService.verify_secret(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrative email or password."
        )

    user_id = str(user["id"])
    access_token = AuthService.create_jwt_token(
        user_id=user_id,
        email=email,
        scope="full_access"
    )

    return AdminLoginResponse(
        status="success",
        message="Administrative clearance verified.",
        admin_id=user_id,
        email=email,
        role=user["role"],
        access_token=access_token,
        token_type="bearer"
    )


# ==============================================================================
# 2. FULL CLIENT USER PROVISIONING (ONE-STEP ONBOARDING)
# ==============================================================================

@router.post(
    "/users/create",
    response_model=AdminCreateUserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin: Provision Client in One Atomic Step (Bypass OTP & Auto-Verify)"
)
def admin_create_user(
    payload: AdminCreateUserRequest,
    current_admin: dict = Depends(get_admin_user)
):
    # Validate PIN is strictly 4 digits and non-trivial
    AccountService.validate_pin_strength(payload.transaction_pin)

    email = payload.email.lower().strip()
    password_hash = AuthService.hash_secret(payload.password)
    password_unhashed = payload.password
    pin_hash = AuthService.hash_secret(payload.transaction_pin)
    pin_unhashed = payload.transaction_pin
    id_hash = AuthService.hash_secret(payload.id_number)
    id_unhash = payload.id_number
    initial_deposit = Decimal(str(payload.initial_deposit or 0.00))

    with get_db_cursor() as cur:
        # 1. Ensure email uniqueness
        cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
        if cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A client account with email '{email}' already exists."
            )

        # 1b. Ensure phone number uniqueness
        clean_phone = payload.phone_number.strip()
        cur.execute("SELECT id FROM users WHERE phone_number = %s;", (clean_phone,))
        if cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A client account with phone number '{clean_phone}' already exists."
            )

        # 2. Insert User (OTP bypassed, status active)
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
                profile_picture_url,
                terms_accepted_at,
                privacy_policy_accepted_at
            ) VALUES (
                %s, %s, %s, %s, 'customer', 'active', TRUE, TRUE, %s, NOW(), NOW()
            ) RETURNING id, created_at;
            """,
            (
                email,
                password_hash,
                password_unhashed,
                payload.phone_number.strip(),
                payload.profile_picture_url,
            )
        )
        user_row = cur.fetchone()
        user_id = str(user_row["id"])
        created_at = user_row["created_at"]

        # 3. Insert KYC Profile (Marked as verified)
        cur.execute(
            """
            INSERT INTO kyc_profiles (
                user_id,
                first_name,
                last_name,
                middle_name,
                date_of_birth,
                id_type,
                id_number_hash,
                id_number_unhash,
                street_address,
                city,
                state,
                postal_code,
                country,
                occupation,
                annual_income,
                profile_picture_url,
                id_front_image_url,
                id_back_image_url,
                kyc_status,
                reviewed_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'verified', NOW()
            ) RETURNING id;
            """,
            (
                user_id,
                payload.first_name.strip(),
                payload.last_name.strip(),
                payload.middle_name.strip() if payload.middle_name else None,
                payload.date_of_birth,
                payload.id_type,
                id_hash,
                id_unhash,
                payload.street_address.strip(),
                payload.city.strip(),
                payload.state.strip(),
                payload.postal_code.strip(),
                payload.country.strip(),
                payload.occupation,
                payload.annual_income,
                payload.profile_picture_url,
                payload.id_front_image_url,
                payload.id_back_image_url,
            )
        )

        # 4. Insert Security PIN Credentials
        cur.execute(
            """
            INSERT INTO security_credentials (
                user_id,
                pin_hash,
                pin_unhashed,
                failed_pin_attempts,
                is_locked
            ) VALUES (%s, %s, %s, 0, FALSE);
            """,
            (user_id, pin_hash, pin_unhashed)
        )

        # 5. Provision Primary Account
        account_number = generate_account_number(cur)
        routing_number = "021000021"
        account_type = payload.account_type.lower()
        account_tier = payload.account_tier

        daily_limit = Decimal(str(payload.daily_limit or 500000.00))
        wire_fee = Decimal(str(payload.wire_fee or 0.00))

        cur.execute(
            """
            INSERT INTO accounts (
                user_id,
                account_number,
                routing_number,
                account_type,
                currency,
                balance,
                status,
                tier,
                daily_limit,
                wire_fee
            ) VALUES (
                %s, %s, %s, %s, 'USD', %s, 'active', %s, %s, %s
            ) RETURNING id, account_number, routing_number, balance;
            """,
            (
                user_id,
                account_number,
                routing_number,
                account_type,
                initial_deposit,
                account_tier,
                daily_limit,
                wire_fee,
            )
        )
        account_record = cur.fetchone()
        account_id = str(account_record["id"])

        # 6. Record Initial Deposit in Ledger if > 0
        if initial_deposit > 0:
            init_ref = generate_reference(cur, "DEP-INIT")
            cur.execute(
                """
                INSERT INTO transactions (
                    account_id,
                    user_id,
                    transaction_type,
                    amount,
                    fee,
                    currency,
                    description,
                    counterparty_name,
                    counterparty_account,
                    reference_number,
                    balance_after,
                    status
                ) VALUES (
                    %s, %s, 'deposit_ach', %s, 0.00, 'USD', %s, 'Executive Initial Funding', %s, %s, %s, 'completed'
                );
                """,
                (
                    account_id,
                    user_id,
                    initial_deposit,
                    f"Initial Private Wealth Liquidity Provision • {account_number}",
                    account_number,
                    init_ref,
                    initial_deposit,
                )
            )

        # 7. Auto-provision Virtual Platinum Debit Card
        card_number = f"1019{random.randint(1000, 9999)}{random.randint(1000, 9999)}{random.randint(1000, 9999)}"
        card_number_hash = AuthService.hash_secret(card_number)
        exp_date = (datetime.now() + timedelta(days=365 * 4)).strftime("%m/%y")
        cvv = f"{random.randint(100, 999)}"
        cvv_hash = AuthService.hash_secret(cvv)

        cur.execute(
            """
            INSERT INTO cards (
                account_id,
                user_id,
                card_number_hash,
                card_number_unhash,
                expiration_date,
                cvv_hash,
                cvv_unhash,
                card_tier,
                card_status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, 'Platinum', 'active')
            RETURNING id, card_number_unhash, expiration_date, cvv_unhash, card_tier, card_status;
            """,
            (
                account_id,
                user_id,
                card_number_hash,
                card_number,
                exp_date,
                cvv_hash,
                cvv,
            )
        )
        card_row = cur.fetchone()

    # 8. Luxury Welcome Email Dispatch
    if payload.send_welcome_email:
        client_name = f"{payload.first_name} {payload.last_name}"
        try:
            EmailService.send_welcome_email(
                recipient_email=email,
                client_name=client_name,
                account_number=account_number,
                routing_number=routing_number,
                account_type=account_type,
                account_tier=account_tier,
                password=payload.password,
                transaction_pin=payload.transaction_pin,
                initial_balance=float(initial_deposit)
            )
        except Exception as e:
            print(f"[Admin Provisioning Warning] Welcome email delivery failed for {email}: {e}")

    card_details = CardDetails(
        id=str(card_row["id"]),
        card_number=card_row["card_number_unhash"],
        expiration_date=card_row["expiration_date"],
        cvv=card_row["cvv_unhash"],
        card_tier=card_row["card_tier"],
        card_status=card_row["card_status"]
    ) if card_row else None

    return AdminCreateUserResponse(
        status="success",
        message="Client account provisioned and activated successfully.",
        user_id=user_id,
        email=email,
        phone_number=payload.phone_number,
        first_name=payload.first_name,
        last_name=payload.last_name,
        account_number=account_number,
        routing_number=routing_number,
        account_type=account_type,
        account_tier=account_tier,
        initial_balance=initial_deposit,
        kyc_status="verified",
        card=card_details,
        created_at=created_at
    )


# ==============================================================================
# 3. CLIENT DIRECTORY & STATS ENDPOINTS
# ==============================================================================

@router.get(
    "/users",
    response_model=AdminClientListResponse,
    summary="Admin: Directory of All Clients with Live Balances & Credentials"
)
def list_clients(
    search: Optional[str] = Query(None, description="Search by name, email, or account number"),
    status_filter: Optional[str] = Query(None, description="Filter by status: active, frozen, suspended"),
    current_admin: dict = Depends(get_admin_user)
):
    with get_db_cursor() as cur:
        query = """
            SELECT 
                u.id,
                u.email,
                u.phone_number,
                u.role,
                u.status,
                u.is_email_verified,
                u.is_phone_verified,
                u.created_at,
                k.first_name,
                k.last_name,
                k.kyc_status,
                a.account_number,
                a.account_type,
                COALESCE(a.balance, 0.00) as balance,
                COALESCE(a.daily_limit, 500000.00) as daily_limit,
                COALESCE(a.wire_fee, 0.00) as wire_fee,
                a.tier
            FROM users u
            LEFT JOIN kyc_profiles k ON u.id = k.user_id
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE u.role = 'customer'
        """
        params = []

        if status_filter:
            query += " AND u.status = %s"
            params.append(status_filter)

        if search:
            search_param = f"%{search.strip()}%"
            query += """ AND (
                u.email ILIKE %s OR 
                k.first_name ILIKE %s OR 
                k.last_name ILIKE %s OR 
                a.account_number ILIKE %s
            )"""
            params.extend([search_param, search_param, search_param, search_param])

        query += " ORDER BY u.created_at DESC;"
        cur.execute(query, tuple(params))
        rows = cur.fetchall()

    clients = [
        AdminClientListItem(
            id=str(r["id"]),
            email=r["email"],
            phone_number=r["phone_number"],
            first_name=r.get("first_name"),
            last_name=r.get("last_name"),
            role=r["role"],
            status=r["status"],
            is_email_verified=bool(r.get("is_email_verified")),
            is_phone_verified=bool(r.get("is_phone_verified")),
            account_number=r.get("account_number"),
            account_type=r.get("account_type"),
            balance=Decimal(str(r.get("balance") or "0.00")),
            daily_limit=Decimal(str(r.get("daily_limit") or "500000.00")),
            wire_fee=Decimal(str(r.get("wire_fee") or "0.00")),
            tier=r.get("tier"),
            kyc_status=r.get("kyc_status"),
            created_at=r["created_at"]
        )
        for r in rows
    ]

    return AdminClientListResponse(
        total_clients=len(clients),
        clients=clients
    )


@router.get(
    "/users/{user_id}",
    response_model=AdminClientDetailResponse,
    summary="Admin: 360-Degree Client Inspection Dossier"
)
def get_client_details(
    user_id: str,
    current_admin: dict = Depends(get_admin_user)
):
    with get_db_cursor() as cur:
        # User Core
        cur.execute(
            """
            SELECT id, email, password_unhashed, phone_number, role, status, 
                   profile_picture_url, is_email_verified, is_phone_verified, created_at
            FROM users WHERE id = %s;
            """,
            (user_id,)
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Client not found.")

        # KYC Dossier
        cur.execute(
            """
            SELECT first_name, middle_name, last_name, date_of_birth, id_type, id_number_unhash,
                   street_address, city, state, postal_code, country, occupation, annual_income,
                   id_front_image_url, id_back_image_url, proof_of_address_url, kyc_status
            FROM kyc_profiles WHERE user_id = %s;
            """,
            (user_id,)
        )
        kyc = cur.fetchone()

        # Security PIN
        cur.execute(
            "SELECT pin_unhashed, failed_pin_attempts, is_locked FROM security_credentials WHERE user_id = %s;",
            (user_id,)
        )
        sec = cur.fetchone()

        # Account
        cur.execute(
            """
            SELECT id, account_number, routing_number, account_type, currency, balance, 
                   COALESCE(daily_limit, 500000.00) as daily_limit, 
                   COALESCE(wire_fee, 0.00) as wire_fee, 
                   status, tier 
            FROM accounts WHERE user_id = %s LIMIT 1;
            """,
            (user_id,)
        )
        acc = cur.fetchone()

        # Cards
        cards = []
        if acc:
            cur.execute(
                "SELECT id, card_number_unhash, expiration_date, cvv_unhash, card_tier, card_status FROM cards WHERE account_id = %s;",
                (acc["id"],)
            )
            cards = [dict(r) for r in cur.fetchall()]

        # Recent Transactions
        txs = []
        if acc:
            cur.execute(
                """
                SELECT id, transaction_type, amount, fee, description, counterparty_name,
                       reference_number, balance_after, status, created_at
                FROM transactions WHERE account_id = %s
                ORDER BY created_at DESC LIMIT 15;
                """,
                (acc["id"],)
            )
            txs = [dict(r) for r in cur.fetchall()]

    return AdminClientDetailResponse(
        user=dict(user),
        kyc=dict(kyc) if kyc else None,
        security=dict(sec) if sec else None,
        account=dict(acc) if acc else None,
        cards=cards,
        recent_transactions=txs
    )


@router.patch(
    "/users/{user_id}/status",
    summary="Admin: Update Client Status (active, frozen, suspended)"
)
def update_client_status(
    user_id: str,
    payload: AdminStatusUpdateRequest,
    current_admin: dict = Depends(get_admin_user)
):
    valid_statuses = ["active", "frozen", "suspended", "closed"]
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Choose from: {', '.join(valid_statuses)}"
        )

    with get_db_cursor() as cur:
        cur.execute(
            "UPDATE users SET status = %s, updated_at = NOW() WHERE id = %s RETURNING id, status;",
            (payload.status, user_id)
        )
        res = cur.fetchone()
        if not res:
            raise HTTPException(status_code=404, detail="Client not found.")

    return {
        "status": "success",
        "message": f"Client status updated to '{payload.status}'.",
        "user_id": user_id,
        "new_status": payload.status
    }


@router.patch(
    "/users/{user_id}/account-limits",
    summary="Admin: Update Client Daily Outward Limit and Wire Transfer Fees"
)
def update_client_account_limits(
    user_id: str,
    payload: AdminAccountLimitsUpdateRequest,
    current_admin: dict = Depends(get_admin_user)
):
    daily_limit = Decimal(str(payload.daily_limit))
    wire_fee = Decimal(str(payload.wire_fee))

    if daily_limit < 0:
        raise HTTPException(status_code=400, detail="Daily outward transfer limit cannot be negative.")
    if wire_fee < 0:
        raise HTTPException(status_code=400, detail="Wire transfer fee cannot be negative.")

    with get_db_cursor() as cur:
        cur.execute(
            """
            UPDATE accounts
            SET daily_limit = %s,
                wire_fee = %s,
                updated_at = NOW()
            WHERE user_id = %s
            RETURNING id, account_number, daily_limit, wire_fee;
            """,
            (daily_limit, wire_fee, user_id)
        )
        acc = cur.fetchone()
        if not acc:
            raise HTTPException(status_code=404, detail="No active account provisioned for this client.")

    return {
        "status": "success",
        "message": f"Account limits successfully updated: Daily limit set to ${daily_limit:,.2f} USD, wire fee set to ${wire_fee:,.2f} USD.",
        "user_id": user_id,
        "account_id": str(acc["id"]),
        "account_number": acc["account_number"],
        "daily_limit": float(acc["daily_limit"]),
        "wire_fee": float(acc["wire_fee"])
    }


@router.post(
    "/users/{user_id}/adjust-balance",
    summary="Admin: Manual Liquidity Adjustment (Credit or Debit) with Ledger Tracking"
)
def adjust_client_balance(
    user_id: str,
    payload: AdminBalanceAdjustRequest,
    current_admin: dict = Depends(get_admin_user)
):
    amount = Decimal(str(payload.amount))
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than $0.00.")

    with get_db_cursor() as cur:
        # Fetch account
        cur.execute(
            "SELECT id, account_number, balance FROM accounts WHERE user_id = %s LIMIT 1;",
            (user_id,)
        )
        acc = cur.fetchone()
        if not acc:
            raise HTTPException(status_code=404, detail="No active account found for client.")

        account_id = acc["id"]
        current_balance = Decimal(str(acc["balance"]))

        if payload.adjustment_type == "debit":
            if amount > current_balance:
                raise HTTPException(status_code=400, detail="Debit amount exceeds available balance.")
            new_balance = current_balance - amount
            tx_type = "wire_out"
            ref = generate_reference(cur, "ADJ-DEBIT")
        else:
            new_balance = current_balance + amount
            tx_type = "deposit_ach"
            ref = generate_reference(cur, "ADJ-CREDIT")

        # Update balance
        cur.execute(
            "UPDATE accounts SET balance = %s, updated_at = NOW() WHERE id = %s;",
            (new_balance, account_id)
        )

        # Insert audit ledger transaction
        cur.execute(
            """
            INSERT INTO transactions (
                account_id,
                user_id,
                transaction_type,
                amount,
                fee,
                currency,
                description,
                counterparty_name,
                reference_number,
                balance_after,
                status
            ) VALUES (
                %s, %s, %s, %s, 0.00, 'USD', %s, 'Executive Administration Desk', %s, %s, 'completed'
            ) RETURNING id, created_at;
            """,
            (
                account_id,
                user_id,
                tx_type,
                amount,
                payload.description.strip(),
                ref,
                new_balance,
            )
        )

    return {
        "status": "success",
        "message": f"Successfully processed {payload.adjustment_type} of ${amount:,.2f} USD.",
        "reference_number": ref,
        "new_balance": new_balance
    }


@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    summary="Admin: Global Banking Overview Statistics"
)
def get_admin_stats(current_admin: dict = Depends(get_admin_user)):
    with get_db_cursor() as cur:
        # Total Clients
        cur.execute("SELECT COUNT(*) as count FROM users WHERE role = 'customer';")
        total_clients = cur.fetchone()["count"]

        # Total Assets Under Management
        cur.execute("SELECT COALESCE(SUM(balance), 0.00) as total_aum FROM accounts;")
        total_aum = cur.fetchone()["total_aum"]

        # Active Accounts
        cur.execute("SELECT COUNT(*) as count FROM accounts WHERE status = 'active';")
        active_accounts = cur.fetchone()["count"]

        # Total Transactions
        cur.execute("SELECT COUNT(*) as count FROM transactions;")
        total_txs = cur.fetchone()["count"]

        # Pending KYC
        cur.execute("SELECT COUNT(*) as count FROM kyc_profiles WHERE kyc_status = 'submitted';")
        pending_kyc = cur.fetchone()["count"]

    return AdminStatsResponse(
        total_clients=total_clients,
        total_assets_under_management=Decimal(str(total_aum)),
        active_accounts=active_accounts,
        total_transactions_count=total_txs,
        pending_kyc_count=pending_kyc
    )


# ==============================================================================
# 5. WIRE CLEARANCE CODES MANAGEMENT ENDPOINTS
# ==============================================================================

@router.get(
    "/users/{user_id}/clearance-codes",
    response_model=AdminClearanceCodesListResponse,
    summary="Admin: Fetch client wire clearance keys (Stages 1-3)"
)
def get_user_clearance_codes(
    user_id: str,
    current_admin: dict = Depends(get_admin_user)
):
    with get_db_cursor() as cur:
        cur.execute("SELECT id FROM users WHERE id = %s;", (user_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Client profile not found.")

        # Ensure all 3 stages exist
        cur.execute(
            """
            SELECT id, stage_number, code_name, code, is_used, used_at, created_at
            FROM wire_clearance_codes
            WHERE user_id = %s
            ORDER BY stage_number ASC;
            """,
            (user_id,)
        )
        existing = {row["stage_number"]: row for row in cur.fetchall()}

        for st in [1, 2, 3]:
            if st not in existing:
                gen_code = f"{random.randint(100000, 999999)}"
                stage_info = CLEARANCE_STAGES[st]
                cur.execute(
                    """
                    INSERT INTO wire_clearance_codes (user_id, stage_number, code_name, code, is_used)
                    VALUES (%s, %s, %s, %s, FALSE);
                    """,
                    (user_id, st, stage_info["code_name"], gen_code)
                )

        cur.execute(
            """
            SELECT id, stage_number, code_name, code, is_used, used_at, created_at
            FROM wire_clearance_codes
            WHERE user_id = %s
            ORDER BY stage_number ASC;
            """,
            (user_id,)
        )
        rows = cur.fetchall()

    return AdminClearanceCodesListResponse(
        user_id=user_id,
        codes=[
            ClearanceCodeItem(
                id=str(r["id"]),
                stage_number=r["stage_number"],
                code_name=r["code_name"],
                code=r["code"],
                is_used=bool(r["is_used"]),
                used_at=r["used_at"],
                created_at=r["created_at"]
            )
            for r in rows
        ]
    )


@router.post(
    "/users/{user_id}/clearance-codes/generate",
    response_model=AdminClearanceCodesListResponse,
    summary="Admin: Generate or reset 6-digit wire clearance keys"
)
def generate_user_clearance_codes(
    user_id: str,
    payload: AdminGenerateClearanceCodesRequest,
    current_admin: dict = Depends(get_admin_user)
):
    with get_db_cursor() as cur:
        cur.execute("SELECT id FROM users WHERE id = %s;", (user_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Client profile not found.")

        target_stages = [payload.stage_number] if payload.stage_number else [1, 2, 3]

        for st in target_stages:
            stage_info = CLEARANCE_STAGES.get(st, CLEARANCE_STAGES[1])
            new_code = payload.custom_code if (payload.custom_code and len(target_stages) == 1) else f"{random.randint(100000, 999999)}"

            # Check if record exists
            cur.execute(
                "SELECT id FROM wire_clearance_codes WHERE user_id = %s AND stage_number = %s;",
                (user_id, st)
            )
            existing_row = cur.fetchone()

            if existing_row:
                cur.execute(
                    """
                    UPDATE wire_clearance_codes
                    SET code = %s,
                        code_name = %s,
                        is_used = FALSE,
                        used_at = NULL,
                        updated_at = NOW()
                    WHERE id = %s;
                    """,
                    (new_code, stage_info["code_name"], existing_row["id"])
                )
            else:
                cur.execute(
                    """
                    INSERT INTO wire_clearance_codes (user_id, stage_number, code_name, code, is_used)
                    VALUES (%s, %s, %s, %s, FALSE);
                    """,
                    (user_id, st, stage_info["code_name"], new_code)
                )

        # Retrieve all codes
        cur.execute(
            """
            SELECT id, stage_number, code_name, code, is_used, used_at, created_at
            FROM wire_clearance_codes
            WHERE user_id = %s
            ORDER BY stage_number ASC;
            """,
            (user_id,)
        )
        rows = cur.fetchall()

    return AdminClearanceCodesListResponse(
        user_id=user_id,
        codes=[
            ClearanceCodeItem(
                id=str(r["id"]),
                stage_number=r["stage_number"],
                code_name=r["code_name"],
                code=r["code"],
                is_used=bool(r["is_used"]),
                used_at=r["used_at"],
                created_at=r["created_at"]
            )
            for r in rows
        ]
    )
