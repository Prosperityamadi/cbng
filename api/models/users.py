from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date

class UserProfileUpdateRequest(BaseModel):
    phone_number: Optional[str] = Field(None, min_length=7, max_length=30)
    profile_picture_url: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New secure password (min 8 chars)")

class ChangePinRequest(BaseModel):
    current_pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$", description="Current 4-digit PIN")
    new_pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$", description="New strictly 4-digit PIN")

class UserProfileResponse(BaseModel):
    # Core Identity
    id: str
    email: str
    phone_number: str
    role: str
    status: str
    is_email_verified: bool
    is_phone_verified: bool
    profile_picture_url: Optional[str] = None
    created_at: datetime
    
    # KYC Info
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    kyc_status: str = "unverified"
    
    # Financial Overview
    account_tier: Optional[str] = None
    has_active_account: bool = False
