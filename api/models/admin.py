from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime


# ==============================================================================
# ADMIN AUTHENTICATION MODELS
# ==============================================================================

class AdminRegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="Administrator email address")
    password: str = Field(..., min_length=8, description="Administrator master password")
    phone_number: Optional[str] = Field("+1 (800) 849-3021", description="Administrative phone number")
    admin_secret_key: Optional[str] = Field(None, description="Optional master provisioning secret key")


class AdminRegisterResponse(BaseModel):
    status: str = "success"
    message: str = "Administrator profile successfully provisioned."
    admin_id: str
    email: str
    role: str = "admin"
    access_token: str
    token_type: str = "bearer"


class AdminLoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Administrator email address")
    password: str = Field(..., description="Administrator password")


class AdminLoginResponse(BaseModel):
    status: str = "success"
    message: str = "Admin session authenticated successfully."
    admin_id: str
    email: str
    role: str
    access_token: str
    token_type: str = "bearer"


# ==============================================================================
# ADMIN USER PROVISIONING MODELS (FULL DIRECT ONBOARDING)
# ==============================================================================

class AdminCreateUserRequest(BaseModel):
    # Authentication & Access
    email: EmailStr = Field(..., description="Client email address")
    password: str = Field(..., min_length=8, description="Initial client password")
    phone_number: str = Field(..., min_length=7, max_length=30, description="Client international phone number")
    
    # Legal & KYC Identity
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: date = Field(..., description="Date of birth (YYYY-MM-DD)")
    id_type: str = Field("passport", description="passport, drivers_license, national_id, ssn")
    id_number: str = Field(..., min_length=4, max_length=100, description="Government ID document number")
    
    # Residential Address
    street_address: str = Field(..., min_length=3, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=2, max_length=20)
    country: str = Field("USA", max_length=100)
    
    # Financial Profile
    occupation: Optional[str] = Field("Private Investor", max_length=100)
    annual_income: Optional[str] = Field("$250,000 - $500,000", max_length=50)
    
    # Document Image URLs
    id_front_image_url: Optional[str] = Field(None, description="URL or storage path of ID front")
    id_back_image_url: Optional[str] = Field(None, description="URL or storage path of ID back")
    profile_picture_url: Optional[str] = Field(None, description="Optional profile avatar URL")
    
    # Security Transaction PIN
    transaction_pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$", description="Strictly 4-digit numeric transaction PIN")
    
    # Banking Provisions
    account_type: str = Field("checking", description="checking or savings")
    account_tier: str = Field("private_wealth", description="private_wealth, premier, standard")
    initial_deposit: Decimal = Field(Decimal("0.00"), ge=0, description="Initial liquidity funding in USD")
    daily_limit: Decimal = Field(Decimal("500000.00"), ge=0, description="Daily transfer limit in USD (starts from $500,000)")
    wire_fee: Decimal = Field(Decimal("0.00"), ge=0, description="Wire transfer processing fee in USD")
    send_welcome_email: bool = Field(True, description="Whether to dispatch the luxury welcome email")


class CardDetails(BaseModel):
    id: str
    card_number: str
    expiration_date: str
    cvv: str
    card_tier: str
    card_status: str


class AdminCreateUserResponse(BaseModel):
    status: str = "success"
    message: str = "Client account provisioned and activated successfully."
    user_id: str
    email: str
    phone_number: str
    first_name: str
    last_name: str
    account_number: str
    routing_number: str
    account_type: str
    account_tier: str
    initial_balance: Decimal
    kyc_status: str = "verified"
    card: Optional[CardDetails] = None
    created_at: datetime


# ==============================================================================
# ADMIN DIRECTORY & CLIENT MANAGEMENT MODELS
# ==============================================================================

class AdminClientListItem(BaseModel):
    id: str
    email: str
    phone_number: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    status: str
    is_email_verified: bool
    is_phone_verified: bool
    account_number: Optional[str] = None
    account_type: Optional[str] = None
    currency: Optional[str] = None
    balance: Decimal = Decimal("0.00")
    daily_limit: Optional[Decimal] = Decimal("500000.00")
    wire_fee: Optional[Decimal] = Decimal("0.00")
    tier: Optional[str] = None
    kyc_status: Optional[str] = None
    created_at: datetime


class AdminClientListResponse(BaseModel):
    total_clients: int
    clients: List[AdminClientListItem]


class AdminClientDetailResponse(BaseModel):
    user: dict
    kyc: Optional[dict] = None
    security: Optional[dict] = None
    account: Optional[dict] = None
    cards: List[dict] = []
    recent_transactions: List[dict] = []


class AdminStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="active, frozen, suspended, closed")


class AdminAccountLimitsUpdateRequest(BaseModel):
    daily_limit: Decimal = Field(..., ge=0, description="Daily outward transfer limit in USD")
    wire_fee: Decimal = Field(Decimal("0.00"), ge=0, description="Wire transfer processing fee in USD")


class AdminBalanceAdjustRequest(BaseModel):
    adjustment_type: str = Field("credit", description="'credit' to add funds or 'debit' to subtract funds")
    amount: Decimal = Field(..., gt=0, description="Adjustment amount in USD")
    description: str = Field("Executive Liquidity Adjustment", description="Memo/Reason for ledger audit")


class AdminStatsResponse(BaseModel):
    total_clients: int
    total_assets_under_management: Decimal
    active_accounts: int
    total_transactions_count: int
    pending_kyc_count: int


class ClearanceCodeItem(BaseModel):
    id: str
    stage_number: int
    code_name: str
    code: str
    is_used: bool
    used_at: Optional[datetime] = None
    created_at: datetime


class AdminClearanceCodesListResponse(BaseModel):
    user_id: str
    codes: List[ClearanceCodeItem]


class AdminGenerateClearanceCodesRequest(BaseModel):
    stage_number: Optional[int] = Field(None, ge=1, le=3, description="Optional 1, 2, 3 or null for all stages")
    custom_code: Optional[str] = Field(None, min_length=6, max_length=6, pattern=r"^\d{6}$", description="Optional manual 6-digit code")

