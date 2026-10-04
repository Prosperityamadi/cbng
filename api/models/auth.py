from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class RegisterIntentRequest(BaseModel):
    email: EmailStr = Field(..., description="Client primary email address")
    password: str = Field(..., min_length=8, description="Secure client password (min 8 chars)")
    phone_number: str = Field(..., min_length=7, max_length=30, description="International phone number")
    terms_accepted: bool = Field(True, description="Agreement to Banking Terms of Service")
    privacy_policy_accepted: bool = Field(True, description="Agreement to Privacy & Compliance Policy")


class RegisterIntentResponse(BaseModel):
    status: str = "pending_verification"
    message: str = "A 6-digit verification code has been dispatched to your email."
    email: str
    expires_in: int = 300


class VerifyOtpRequest(BaseModel):
    email: EmailStr = Field(..., description="Client primary email address")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit numerical verification OTP")


class VerifyOtpResponse(BaseModel):
    status: str = "verified"
    onboarding_token: str
    token_type: str = "bearer"
    next_step: str = "kyc_profile"
    message: str = "Email verified successfully."


class ResendOtpRequest(BaseModel):
    email: EmailStr = Field(..., description="Client primary email address")


class ResendOtpResponse(BaseModel):
    status: str = "resent"
    message: str = "A fresh 6-digit verification code has been dispatched."
    expires_in: int = 300


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Client email address")
    password: str = Field(..., description="Client password")


class UserOut(BaseModel):
    id: str
    email: str
    phone_number: str
    role: str = "customer"
    status: str = "pending_verification"
    profile_picture_url: Optional[str] = None
    is_email_verified: bool = False
    is_phone_verified: bool = False
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user: UserOut
    status: str = "active"
    next_step: Optional[str] = None
