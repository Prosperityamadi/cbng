import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from api.dependencies import get_optional_user, get_current_user, get_admin_user
from api.database import get_db_cursor
from api.services.email_service import EmailService

router = APIRouter(prefix="/api/py/contact", tags=["Contact Concierge"])


class ContactMessageRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Full name of client or prospect")
    email: EmailStr = Field(..., description="Direct contact email for reply")
    phone: Optional[str] = Field(None, max_length=50, description="Contact phone number")
    subject: str = Field(..., min_length=2, max_length=200, description="Inquiry category or subject")
    message: str = Field(..., min_length=5, max_length=5000, description="Detailed inquiry message body")


class ContactMessageResponse(BaseModel):
    success: bool
    message: str
    inquiry_id: str
    status: str
    delivery_destination: str


@router.post("", response_model=ContactMessageResponse)
def submit_contact_message(
    req: ContactMessageRequest,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """
    Submits a secure inquiry to NemiCapital Support.
    Populates database in backend and delivers message to support@nemicapital.com.
    """
    cleaned_name = req.name.strip()
    cleaned_email = req.email.strip().lower()
    cleaned_phone = req.phone.strip() if req.phone else None
    cleaned_subject = req.subject.strip()
    cleaned_message = req.message.strip()

    if not cleaned_name or not cleaned_email or not cleaned_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, email, and message are required fields.",
        )

    user_id = user["id"] if user else None
    delivery_email = "support@nemicapital.com"

    try:
        with get_db_cursor() as cur:
            cur.execute(
                """
                INSERT INTO contact_messages (
                    user_id,
                    name,
                    email,
                    phone,
                    subject,
                    message,
                    status,
                    delivery_recipient
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, created_at;
                """,
                (
                    user_id,
                    cleaned_name,
                    cleaned_email,
                    cleaned_phone,
                    cleaned_subject,
                    cleaned_message,
                    "delivered",
                    delivery_email,
                ),
            )
            created_row = cur.fetchone()
            inquiry_id = str(created_row["id"]) if created_row else str(uuid.uuid4())

        # Dispatch notification to support@nemicapital.com
        EmailService.send_contact_inquiry(
            sender_name=cleaned_name,
            sender_email=cleaned_email,
            subject=cleaned_subject,
            message=cleaned_message,
            inquiry_id=inquiry_id,
            phone=cleaned_phone,
            delivery_destination=delivery_email,
        )

        return ContactMessageResponse(
            success=True,
            message=f"Inquiry successfully received. Our Support Team has been alerted at {delivery_email}.",
            inquiry_id=inquiry_id,
            status="delivered",
            delivery_destination=delivery_email,
        )
    except Exception as e:
        print(f"[ContactRouter] Error saving contact message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record contact message: {str(e)}",
        )


@router.get("/my-inquiries")
def get_user_inquiries(
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieves previous contact inquiries sent by the authenticated client.
    """
    with get_db_cursor(commit=False) as cur:
        cur.execute(
            """
            SELECT id, name, email, subject, message, status, delivery_recipient, created_at
            FROM contact_messages
            WHERE user_id = %s OR email = %s
            ORDER BY created_at DESC
            LIMIT 50;
            """,
            (user["id"], user["email"]),
        )
        rows = cur.fetchall()
        return {"inquiries": [dict(r) for r in rows]}


@router.get("/admin/all")
def get_admin_all_inquiries(
    admin: Dict[str, Any] = Depends(get_admin_user),
):
    """
    Admin endpoint to inspect all submitted concierge inquiries.
    """
    with get_db_cursor(commit=False) as cur:
        cur.execute(
            """
            SELECT id, user_id, name, email, subject, message, status, delivery_recipient, created_at
            FROM contact_messages
            ORDER BY created_at DESC
            LIMIT 100;
            """
        )
        rows = cur.fetchall()
        return {"inquiries": [dict(r) for r in rows]}
