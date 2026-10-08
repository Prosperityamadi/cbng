import random
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any
from fastapi import HTTPException, status
from api.database import get_db_cursor
from api.services.auth_service import AuthService
from api.services.email_service import EmailService

WEAK_PINS = {
    "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999",
    "1234", "4321", "0123", "3210", "1212", "6969", "2580", "1357", "2468",
}


class AccountService:
    @staticmethod
    def validate_pin_strength(pin: str) -> None:
        """
        Enforces institutional banking PIN complexity rules:
        - Must be numeric
        - Must be strictly 4 digits
        - Must not be trivial, repeating, or sequential
        """
        clean_pin = pin.strip()
        if not clean_pin.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction PIN must contain numbers only.",
            )
        if len(clean_pin) != 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction PIN must be exactly 4 digits.",
            )
        if clean_pin in WEAK_PINS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PIN is too common or easily guessed. Please choose a more secure 4-digit code.",
            )
        if len(set(clean_pin)) == 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PIN cannot consist of identical repeating numbers.",
            )

    @staticmethod
    def generate_unique_account_number(cur) -> str:
        """Generates a collision-checked institutional 10-digit account number starting with 10."""
        for _ in range(10):
            candidate = f"10{random.randint(10000000, 99999999)}"
            cur.execute("SELECT id FROM accounts WHERE account_number = %s;", (candidate,))
            if not cur.fetchone():
                return candidate
        raise RuntimeError("Failed to generate a unique account number after multiple attempts.")

    @classmethod
    def provision_account(
        cls,
        current_user: Dict[str, Any],
        account_type: str,
        transaction_pin: str
    ) -> Dict[str, Any]:
        """
        Core Banking Provisioning Workflow:
        1. Validate PIN complexity
        2. Hash PIN (bcrypt) + retain unhashed for educational inspection
        3. Provision checking account (10-digit number, routing 021000021, USD)
        4. Advance user status to 'active'
        5. Dispatch Private Wealth welcome letter via Resend
        6. Issue full-session JWT
        """
        user_id = str(current_user["id"])
        email = current_user["email"]

        # Validate PIN
        cls.validate_pin_strength(transaction_pin)

        # Hashes and plaintext retention
        pin_hash = AuthService.hash_secret(transaction_pin)
        pin_unhashed = transaction_pin

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

            # Determine currency from KYC country
            cur.execute("SELECT country FROM kyc_profiles WHERE user_id = %s;", (user_id,))
            kyc_record = cur.fetchone()
            country_code = kyc_record["country"] if kyc_record else "USA"
            currency_map = {
                'DZ': 'DZD', 'AR': 'ARS', 'AU': 'AUD', 'AT': 'EUR', 'BD': 'BDT', 'BE': 'EUR', 'BR': 'BRL', 'CA': 'CAD',
                'CL': 'CLP', 'CN': 'CNY', 'CO': 'COP', 'DK': 'DKK', 'EG': 'EGP', 'FI': 'EUR', 'FR': 'EUR', 'DE': 'EUR',
                'GH': 'GHS', 'IN': 'INR', 'ID': 'IDR', 'IE': 'EUR', 'IT': 'EUR', 'JP': 'JPY', 'KE': 'KES', 'MY': 'MYR',
                'MU': 'MUR', 'MX': 'MXN', 'MA': 'MAD', 'NL': 'EUR', 'NZ': 'NZD', 'NG': 'NGN', 'NO': 'NOK', 'PK': 'PKR',
                'PH': 'PHP', 'PL': 'PLN', 'PT': 'EUR', 'RU': 'RUB', 'RW': 'RWF', 'SA': 'SAR', 'SG': 'SGD', 'ZA': 'ZAR',
                'KR': 'KRW', 'ES': 'EUR', 'SE': 'SEK', 'CH': 'CHF', 'TZ': 'TZS', 'TH': 'THB', 'TN': 'TND', 'TR': 'TRY',
                'UG': 'UGX', 'AE': 'AED', 'GB': 'GBP', 'US': 'USD', 'VN': 'VND', 'ZM': 'ZMW', 'ZW': 'ZWL',
                'USA': 'USD', 'CAN': 'CAD', 'GBR': 'GBP', 'AUS': 'AUD', 'ZAF': 'ZAR', 'NGA': 'NGN', 'GHA': 'GHS', 'KEN': 'KES'
            }
            currency = currency_map.get(country_code, "USD")

            # 2. Check existing account
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
                account_number = cls.generate_unique_account_number(cur)
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
                    ) VALUES (%s, %s, %s, %s, %s, 0.00, 'active', 'private_wealth')
                    RETURNING id, account_number, routing_number, account_type, currency, balance, status, tier;
                    """,
                    (user_id, account_number, routing_number, account_type, currency)
                )
                account_record = cur.fetchone()
                account_id = account_record["id"]

                # Auto-provision Virtual Card
                card_number = f"1019{random.randint(1000, 9999)}{random.randint(1000, 9999)}{random.randint(1000, 9999)}"
                card_number_hash = AuthService.hash_secret(card_number)
                
                exp_date_obj = datetime.now() + timedelta(days=365*4)
                exp_date = exp_date_obj.strftime("%m/%y")
                
                cvv = f"{random.randint(1000, 9999)}"
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
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, 'Platinum', 'active');
                    """,
                    (account_id, user_id, card_number_hash, card_number, exp_date, cvv_hash, cvv)
                )
            else:
                account_record = existing_account

            # 3. Advance user status to 'active'
            cur.execute(
                "UPDATE users SET status = 'active', updated_at = NOW() WHERE id = %s;",
                (user_id,)
            )

            # 4. Fetch Client Legal Name for Welcome Letter
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

        return {
            "status": "active",
            "message": "Congratulations! Your NemiCapital International Bank account is active.",
            "account": {
                "id": str(account_record["id"]),
                "account_number": account_record["account_number"],
                "routing_number": account_record["routing_number"],
                "account_type": account_record["account_type"],
                "currency": account_record["currency"],
                "balance": Decimal(str(account_record["balance"])),
                "status": account_record["status"],
                "tier": account_record.get("tier", "private_wealth"),
            },
            "access_token": access_token,
            "token_type": "bearer",
            "next_step": "dashboard"
        }

    @staticmethod
    def get_primary_account(user_id: str) -> Dict[str, Any]:
        """Fetches the primary active checking account for an authenticated client."""
        with get_db_cursor() as cur:
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

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active bank account found for this user.",
            )

        return {
            "id": str(account["id"]),
            "account_number": account["account_number"],
            "routing_number": account["routing_number"],
            "account_type": account["account_type"],
            "currency": account["currency"],
            "balance": Decimal(str(account["balance"])),
            "status": account["status"],
            "tier": account.get("tier", "private_wealth"),
        }
