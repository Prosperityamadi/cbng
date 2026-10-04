from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class DepositRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Deposit amount in USD (must be > 0)")
    deposit_method: str = Field("ach", description="Deposit method: 'ach', 'wire', or 'instant'")
    source_institution: Optional[str] = Field("External Liquidity Source", description="Originating financial institution")
    note: Optional[str] = Field(None, description="Optional client note or internal reference")


class DepositResponse(BaseModel):
    transaction_id: str
    reference_number: str
    amount: Decimal
    fee: Decimal = Decimal("0.00")
    new_balance: Decimal
    status: str = "completed"
    message: str = "Instant liquidity deposit successfully credited."
    created_at: datetime


class WireTransferRequest(BaseModel):
    recipient_name: str = Field(..., min_length=2, description="Recipient individual or institutional beneficiary name")
    recipient_account: str = Field(..., min_length=4, description="Recipient IBAN, ABA routing, or Account number")
    amount: Decimal = Field(..., gt=0, description="Wire transfer amount in USD (must be > 0)")
    transaction_pin: Optional[str] = Field(None, min_length=4, max_length=4, pattern=r"^\d{4}$", description="Optional strictly 4-digit security PIN")
    note: Optional[str] = Field(None, description="Wire memo or reference note")


class WireTransferResponse(BaseModel):
    transaction_id: str
    reference_number: str
    recipient_name: str
    recipient_account: str
    amount: Decimal
    fee: Decimal = Decimal("0.00")
    new_balance: Decimal
    status: str = "completed"
    message: str = "Fedwire real-time transfer successfully dispatched."
    created_at: datetime


class TransactionItemResponse(BaseModel):
    id: str
    account_id: str
    transaction_type: str
    amount: Decimal
    fee: Decimal = Decimal("0.00")
    currency: str = "USD"
    description: str
    counterparty_name: Optional[str] = None
    counterparty_account: Optional[str] = None
    reference_number: Optional[str] = None
    balance_after: Optional[Decimal] = None
    status: str = "completed"
    created_at: datetime


class TransactionListResponse(BaseModel):
    account_number: str
    current_balance: Decimal
    total_count: int
    transactions: List[TransactionItemResponse]


class WireClearanceInitiateRequest(BaseModel):
    recipient_name: str = Field(..., min_length=2)
    recipient_account: str = Field(..., min_length=4)
    amount: Decimal = Field(..., gt=0)
    note: Optional[str] = None


class WireClearanceInitiateResponse(BaseModel):
    status: str = "clearance_required"
    stage: int
    title: str
    code_name: str
    description: str
    support_email: str = "support@nemicapbank.com"


class WireClearanceVerifyRequest(BaseModel):
    stage: int = Field(..., ge=1, le=3)
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    amount: Decimal = Field(..., gt=0)
    recipient_name: str = Field(..., min_length=2)
    recipient_account: str = Field(..., min_length=4)
    note: Optional[str] = None


class WireClearanceVerifyResponse(BaseModel):
    status: str
    stage: Optional[int] = None
    title: Optional[str] = None
    code_name: Optional[str] = None
    description: Optional[str] = None
    support_email: Optional[str] = None
    transaction: Optional[WireTransferResponse] = None


class PendingWireTransferResponse(BaseModel):
    has_pending: bool
    amount: Optional[Decimal] = None
    fee: Optional[Decimal] = None
    recipient_name: Optional[str] = None
    recipient_account: Optional[str] = None
    current_stage: Optional[int] = None
    stage_title: Optional[str] = None
    code_name: Optional[str] = None
    description: Optional[str] = None
    support_email: Optional[str] = "support@nemicapbank.com"
    created_at: Optional[datetime] = None


class CancelPendingWireResponse(BaseModel):
    status: str = "cancelled"
    message: str = "Pending wire transfer successfully cancelled and clearance sequence reset."

