from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class AccountSetupRequest(BaseModel):
    account_type: str = Field("checking", description="checking, savings, investment")
    transaction_pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$", description="Strictly 4-digit numeric transaction PIN")


class AccountResponse(BaseModel):
    id: str
    account_number: str
    routing_number: str = "021000021"
    account_type: str = "checking"
    currency: str = "USD"
    balance: Decimal = Decimal("0.00")
    status: str = "active"
    tier: str = "standard"
    daily_limit: Decimal = Decimal("500000.00")
    wire_fee: Decimal = Decimal("0.00")


class AccountSetupResponse(BaseModel):
    status: str = "active"
    message: str = "Congratulations! Your NemiCapital International Bank account is active."
    account: AccountResponse
    access_token: str
    token_type: str = "bearer"
    next_step: str = "dashboard"
