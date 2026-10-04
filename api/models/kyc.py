from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class KycSubmitRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: date = Field(..., description="Date of birth (YYYY-MM-DD)")
    id_type: str = Field(..., description="passport, drivers_license, national_id, ssn")
    id_number: str = Field(..., min_length=4, max_length=100, description="Government ID document number")
    street_address: str = Field(..., min_length=3, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=2, max_length=20)
    country: str = Field("USA", max_length=3)
    occupation: Optional[str] = Field(None, max_length=100)
    annual_income: Optional[str] = Field(None, max_length=50)
    profile_picture_url: Optional[str] = None
    id_front_image_url: Optional[str] = None
    id_back_image_url: Optional[str] = None
    proof_of_address_url: Optional[str] = None


class KycProfileResponse(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    date_of_birth: date
    id_type: str
    street_address: str
    city: str
    state: str
    postal_code: str
    country: str
    occupation: Optional[str] = None
    annual_income: Optional[str] = None
    profile_picture_url: Optional[str] = None
    kyc_status: str = "submitted"


class KycSubmitResponse(BaseModel):
    status: str = "kyc_submitted"
    message: str = "KYC documents and personal profile submitted for verification."
    next_step: str = "security_pin"
