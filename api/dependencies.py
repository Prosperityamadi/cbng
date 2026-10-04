from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from api.services.auth_service import AuthService
from api.database import get_db_cursor

security_bearer = HTTPBearer(auto_error=False)


def get_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    """Extracts and validates JWT payload from Authorization Bearer header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = AuthService.decode_jwt_token(token)
        return payload
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_onboarding_user(
    payload: Dict[str, Any] = Depends(get_token_payload)
) -> Dict[str, Any]:
    """
    Validates user for onboarding steps (KYC Profile and Account Provisioning).
    Accepts tokens with scope 'onboarding' or 'full_access'.
    """
    scope = payload.get("scope")
    if scope not in ["onboarding", "full_access"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token does not possess valid onboarding authorization scope.",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User identifier missing from authentication token.",
        )

    with get_db_cursor() as cur:
        cur.execute(
            "SELECT id, email, phone_number, role, status, profile_picture_url, is_email_verified, is_phone_verified, created_at FROM users WHERE id = %s;",
            (user_id,)
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account record not found in system.",
            )
        return dict(user)


def get_current_user(
    payload: Dict[str, Any] = Depends(get_token_payload)
) -> Dict[str, Any]:
    """
    Validates user for fully authenticated banking sessions.
    Requires scope 'full_access'.
    """
    scope = payload.get("scope")
    if scope != "full_access":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Full session access required. Please complete account activation.",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User identifier missing from authentication token.",
        )

    with get_db_cursor() as cur:
        cur.execute(
            "SELECT id, email, phone_number, role, status, profile_picture_url, is_email_verified, is_phone_verified, created_at FROM users WHERE id = %s;",
            (user_id,)
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account record not found.",
            )
        
        if user["status"] == "suspended" or user["status"] == "closed":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This account is {user['status']}. Please contact NemiCapital Compliance.",
            )

        return dict(user)


def get_admin_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Validates that the currently authenticated user possesses administrative role privileges.
    """
    role = current_user.get("role", "")
    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Administrative privileges required.",
        )
    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[Dict[str, Any]]:
    """
    Optional user extractor: returns user dict if valid Bearer token provided, or None.
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = AuthService.decode_jwt_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            return None
        with get_db_cursor() as cur:
            cur.execute(
                "SELECT id, email, phone_number, role, status, profile_picture_url FROM users WHERE id = %s;",
                (user_id,)
            )
            user = cur.fetchone()
            return dict(user) if user else None
    except Exception:
        return None

