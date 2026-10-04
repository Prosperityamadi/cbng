from fastapi import APIRouter, Depends
from api.dependencies import get_current_user
from api.models.users import UserProfileResponse, UserProfileUpdateRequest, ChangePasswordRequest, ChangePinRequest
from api.services.user_service import UserService

users_router = APIRouter(prefix="/api/py/users", tags=["Users Profile"])

@users_router.get("/me/profile", response_model=UserProfileResponse)
def get_my_profile(user=Depends(get_current_user)):
    """Retrieve full user profile including KYC and Account summary."""
    return UserService.get_user_profile(user["id"])

@users_router.patch("/me/profile")
def update_my_profile(req: UserProfileUpdateRequest, user=Depends(get_current_user)):
    """Update basic profile information (phone, profile picture)."""
    return UserService.update_profile(user["id"], req)

@users_router.post("/me/security/change-password")
def change_password(req: ChangePasswordRequest, user=Depends(get_current_user)):
    """Change user password."""
    return UserService.change_password(user["id"], req)

@users_router.post("/me/security/change-pin")
def change_pin(req: ChangePinRequest, user=Depends(get_current_user)):
    """Change user transaction PIN."""
    return UserService.change_pin(user["id"], req)
