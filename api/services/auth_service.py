from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError
from api.config import settings


class AuthService:
    @staticmethod
    def hash_secret(secret_plaintext: str) -> str:
        """Hashes a password or PIN using bcrypt with work factor 12."""
        salt = bcrypt.gensalt(rounds=12)
        hashed_bytes = bcrypt.hashpw(secret_plaintext.encode('utf-8'), salt)
        return hashed_bytes.decode('utf-8')

    @staticmethod
    def verify_secret(secret_plaintext: str, hashed_value: str) -> bool:
        """Verifies a plaintext password or PIN against its bcrypt hash."""
        try:
            return bcrypt.checkpw(
                secret_plaintext.encode('utf-8'),
                hashed_value.encode('utf-8')
            )
        except Exception:
            return False

    @staticmethod
    def create_jwt_token(
        user_id: str,
        email: str,
        scope: str = "full_access",
        expires_minutes: Optional[int] = None
    ) -> str:
        """
        Creates a signed JWT token.
        - scope='onboarding': restricted token for Step 3 (KYC) and Step 4 (PIN/Account).
        - scope='full_access': standard session token for dashboard and banking operations.
        """
        if expires_minutes is None:
            expires_minutes = (
                settings.ONBOARDING_TOKEN_EXPIRE_MINUTES
                if scope == "onboarding"
                else settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )

        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
        payload: Dict[str, Any] = {
            "sub": user_id,
            "email": email.lower().strip(),
            "scope": scope,
            "exp": expire,
            "iat": datetime.now(timezone.utc)
        }

        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def decode_jwt_token(token: str) -> Dict[str, Any]:
        """Decodes and validates a JWT token signature and expiration."""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except JWTError as e:
            raise ValueError(f"Invalid or expired token: {str(e)}")
