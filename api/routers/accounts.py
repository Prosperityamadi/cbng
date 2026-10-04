import random
from decimal import Decimal
from fastapi import APIRouter, HTTPException, status, Depends
from api.models.account import AccountSetupRequest, AccountSetupResponse, AccountResponse
from api.database import get_db_cursor
from api.services.auth_service import AuthService
from api.services.email_service import EmailService
from api.services.account_service import AccountService
from api.dependencies import get_onboarding_user, get_current_user

router = APIRouter(prefix="/api/py/accounts", tags=["Account Provisioning & Banking"])


def generate_account_number(cur) -> str:
    """Generates an institutional 10-digit account number starting with 10."""
    while True:
        candidate = f"10{random.randint(10000000, 99999999)}"
        cur.execute("SELECT id FROM accounts WHERE account_number = %s;", (candidate,))
        if not cur.fetchone():
            return candidate


@router.post(
    "/setup",
    response_model=AccountSetupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Step 4: Establish Security PIN & Provision Private Wealth Account"
)
def setup_account(
    payload: AccountSetupRequest,
    current_user: dict = Depends(get_onboarding_user)
):
    user_id = str(current_user["id"])
    email = current_user["email"]

    # Validate PIN is strictly 4 digits
    AccountService.validate_pin_strength(payload.transaction_pin)

    # Security PIN hashing & unhashed retention for inspection
    pin_hash = AuthService.hash_secret(payload.transaction_pin)
    pin_unhashed = payload.transaction_pin

    with get_db_cursor() as cur:
        # 1. Upsert Security PIN Credentials
        cur.execute(
            """
            INSERT INTO security_credentials (
                user_id,
                pin_hash,
                pin_unhashed,
                failed_pin_attempts,
                is_locked
            ) VALUES (%s, %s, %s, 0, FALSE)
            ON CONFLICT (user_id) DO UPDATE SET
                pin_hash = EXCLUDED.pin_hash,
                pin_unhashed = EXCLUDED.pin_unhashed,
                failed_pin_attempts = 0,
                is_locked = FALSE,
                updated_at = NOW();
            """,
            (user_id, pin_hash, pin_unhashed)
        )

        # 2. Check if user already has an active account
        cur.execute(
            """
            SELECT id, account_number, routing_number, account_type, currency, balance, status, tier
            FROM accounts
            WHERE user_id = %s;
            """,
            (user_id,)
        )
        existing_account = cur.fetchone()

        if not existing_account:
            # Provision fresh institutional account
            account_number = generate_account_number(cur)
            routing_number = "021000021"

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
                    tier
                ) VALUES (%s, %s, %s, %s, 'USD', 0.00, 'active', 'private_wealth')
                RETURNING id, account_number, routing_number, account_type, currency, balance, status, tier;
                """,
                (user_id, account_number, routing_number, payload.account_type)
            )
            account_record = cur.fetchone()
        else:
            account_record = existing_account

        # 3. Activate User Status
        cur.execute(
            "UPDATE users SET status = 'active', updated_at = NOW() WHERE id = %s;",
            (user_id,)
        )

        # 4. Fetch User Full Legal Name for Welcome Letter
        cur.execute("SELECT first_name, last_name FROM kyc_profiles WHERE user_id = %s;", (user_id,))
        kyc = cur.fetchone()
        client_name = f"{kyc['first_name']} {kyc['last_name']}" if kyc else "Valued Client"

    # 5. Issue Full Access Session JWT
    access_token = AuthService.create_jwt_token(
        user_id=user_id,
        email=email,
        scope="full_access"
    )

    # 6. Dispatch Luxury Welcome Email via Resend
    try:
        EmailService.send_welcome_email(
            recipient_email=email,
            client_name=client_name,
            account_number=account_record["account_number"],
            routing_number=account_record["routing_number"]
        )
    except Exception as e:
        print(f"[EmailService Warning] Failed to send welcome letter to {email}: {e}")

    return AccountSetupResponse(
        status="active",
        message="Congratulations! Your NemiCapital International Bank account is active.",
        account=AccountResponse(
            id=str(account_record["id"]),
            account_number=account_record["account_number"],
            routing_number=account_record["routing_number"],
            account_type=account_record["account_type"],
            currency=account_record["currency"],
            balance=Decimal(str(account_record["balance"])),
            status=account_record["status"],
            tier=account_record.get("tier", "private_wealth")
        ),
        access_token=access_token,
        token_type="bearer",
        next_step="dashboard"
    )


@router.get(
    "/primary",
    response_model=AccountResponse,
    summary="Get Primary Checking Account Details & Live Balance"
)
def get_primary_account(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["id"])
    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT id, account_number, routing_number, account_type, currency, balance, status, tier,
                   COALESCE(daily_limit, 500000.00) as daily_limit,
                   COALESCE(wire_fee, 0.00) as wire_fee
            FROM accounts
            WHERE user_id = %s
            ORDER BY created_at ASC
            LIMIT 1;
            """,
            (user_id,)
        )
        account = cur.fetchone()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active bank account found for this user.",
        )

    return AccountResponse(
        id=str(account["id"]),
        account_number=account["account_number"],
        routing_number=account["routing_number"],
        account_type=account["account_type"],
        currency=account["currency"],
        balance=Decimal(str(account["balance"])),
        status=account["status"],
        tier=account.get("tier", "private_wealth"),
        daily_limit=Decimal(str(account.get("daily_limit", "500000.00"))),
        wire_fee=Decimal(str(account.get("wire_fee", "0.00")))
    )


@router.get(
    "/dashboard",
    summary="Get Full Dashboard Summary (Account, Cards, Transactions)"
)
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["id"])
    with get_db_cursor() as cur:
        # Get primary account
        cur.execute(
            """
            SELECT id, account_number, routing_number, account_type, currency, balance, status, tier,
                   COALESCE(daily_limit, 500000.00) as daily_limit,
                   COALESCE(wire_fee, 0.00) as wire_fee
            FROM accounts
            WHERE user_id = %s
            ORDER BY created_at ASC
            LIMIT 1;
            """,
            (user_id,)
        )
        account = cur.fetchone()

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active bank account found for this user.",
            )

        account_id = account["id"]
        
        # Get cards
        cur.execute(
            """
            SELECT id, card_number_unhash as card_number, expiration_date, cvv_unhash as cvv, card_tier, card_status
            FROM cards
            WHERE account_id = %s;
            """,
            (account_id,)
        )
        cards = [dict(row) for row in cur.fetchall()]

        # Get latest transactions with full ledger details
        cur.execute(
            """
            SELECT id, transaction_type, amount, fee, currency, description, counterparty_name, counterparty_account, reference_number, balance_after, status, created_at
            FROM transactions
            WHERE account_id = %s
            ORDER BY created_at DESC
            LIMIT 25;
            """,
            (account_id,)
        )
        transactions = [dict(row) for row in cur.fetchall()]

    return {
        "account": dict(account),
        "cards": cards,
        "transactions": transactions
    }
