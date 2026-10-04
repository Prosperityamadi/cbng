import random
import re
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from api.models.transactions import (
    DepositRequest,
    DepositResponse,
    WireTransferRequest,
    WireTransferResponse,
    TransactionItemResponse,
    TransactionListResponse,
    WireClearanceInitiateRequest,
    WireClearanceInitiateResponse,
    WireClearanceVerifyRequest,
    WireClearanceVerifyResponse,
    PendingWireTransferResponse,
    CancelPendingWireResponse,
)
from api.database import get_db_cursor
from api.dependencies import get_current_user
from api.services.auth_service import AuthService

CLEARANCE_STAGES = {
    1: {
        "stage_number": 1,
        "code_name": "COT Code (Cost of Transfer & AML Clearance Key)",
        "title": "Cost of Transfer (COT) & AML Clearance Key Required",
        "description": "Pursuant to interbank AML protocols, this outward transfer requires an authenticated Cost of Transfer (COT) Clearance Key before it can be processed. Please contact Private Wealth Support to obtain your 6-digit authorization code."
    },
    2: {
        "stage_number": 2,
        "code_name": "IMF / Tax Code (International Monetary Tax & Liquidity Clearance)",
        "title": "International Monetary Tax & Compliance Key Required",
        "description": "This transaction has triggered cross-border compliance screening. An active IMF / International Tax Clearance Key must be provided to release escrow holds. Please contact Private Wealth Support to obtain your 6-digit clearance code."
    },
    3: {
        "stage_number": 3,
        "code_name": "Final Fedwire Release Key (Federal Reserve Wire Authorization)",
        "title": "Federal Reserve Final Wire Authorization Key Required",
        "description": "Final settlement protocol requires Federal Reserve wire authorization clearance. Once this key is confirmed, funds will be permanently debited and dispatched. Please contact Private Wealth Support to obtain your final 6-digit release key."
    }
}

router = APIRouter(prefix="/api/py/transactions", tags=["Banking Ledger & Transactions"])


def generate_unique_reference(cur, prefix: str) -> str:
    """Generates an institutional banking reference code (e.g. FW-839201 or ACH-291034)."""
    while True:
        candidate = f"{prefix}-{random.randint(100000, 999999)}"
        cur.execute("SELECT id FROM transactions WHERE reference_number = %s;", (candidate,))
        if not cur.fetchone():
            return candidate


@router.post(
    "/deposit",
    response_model=DepositResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Deposit liquidity into primary checking account"
)
def deposit_funds(
    payload: DepositRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])
    amount = Decimal(str(payload.amount))

    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deposit amount must be strictly greater than $0.00."
        )

    with get_db_cursor() as cur:
        # 1. Fetch user's primary account
        cur.execute(
            """
            SELECT id, account_number, balance 
            FROM accounts 
            WHERE user_id = %s 
            ORDER BY created_at ASC 
            LIMIT 1;
            """,
            (user_id,)
        )
        account = cur.fetchone()

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active bank account provisioned for this client."
            )

        account_id = account["id"]
        current_balance = Decimal(str(account["balance"]))
        new_balance = current_balance + amount

        # 2. Generate unique ACH reference number
        ref_prefix = "ACH" if payload.deposit_method == "ach" else "DEP"
        ref_number = generate_unique_reference(cur, ref_prefix)

        # 3. Update account balance
        cur.execute(
            "UPDATE accounts SET balance = %s, updated_at = NOW() WHERE id = %s;",
            (new_balance, account_id)
        )

        # 4. Insert transaction ledger entry
        description = f"Direct ACH Liquidity Deposit • {payload.source_institution or 'Instant Clearing'}"
        cur.execute(
            """
            INSERT INTO transactions (
                account_id,
                user_id,
                transaction_type,
                amount,
                fee,
                currency,
                description,
                counterparty_name,
                counterparty_account,
                reference_number,
                balance_after,
                status
            ) VALUES (
                %s, %s, %s, %s, 0.00, 'USD', %s, %s, %s, %s, %s, 'completed'
            ) RETURNING id, created_at;
            """,
            (
                account_id,
                user_id,
                "deposit_ach",
                amount,
                description,
                payload.source_institution or "External Clearing",
                account["account_number"],
                ref_number,
                new_balance,
            )
        )
        tx = cur.fetchone()

    return DepositResponse(
        transaction_id=str(tx["id"]),
        reference_number=ref_number,
        amount=amount,
        fee=Decimal("0.00"),
        new_balance=new_balance,
        status="completed",
        message="Instant liquidity deposit successfully credited to your Private Wealth account.",
        created_at=tx["created_at"],
    )


@router.post(
    "/transfer",
    response_model=WireTransferResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Execute real-time Fedwire fund dispatch"
)
def execute_wire_transfer(
    payload: WireTransferRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])
    amount = Decimal(str(payload.amount))

    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer amount must be strictly greater than $0.00."
        )

    with get_db_cursor() as cur:
        # 1. Fetch user's primary account
        cur.execute(
            """
            SELECT id, account_number, balance,
                   COALESCE(daily_limit, 500000.00) as daily_limit,
                   COALESCE(wire_fee, 0.00) as wire_fee
            FROM accounts 
            WHERE user_id = %s 
            ORDER BY created_at ASC 
            LIMIT 1;
            """,
            (user_id,)
        )
        account = cur.fetchone()

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active bank account provisioned for this client."
            )

        account_id = account["id"]
        current_balance = Decimal(str(account["balance"]))
        daily_limit = Decimal(str(account["daily_limit"]))
        wire_fee = Decimal(str(account["wire_fee"]))
        total_deduction = amount + wire_fee

        # 2. Check daily outward transfer limit
        if amount > daily_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transfer amount exceeds your daily outward transfer limit of ${daily_limit:,.2f} USD. Please contact Private Wealth desk to request a limit increase."
            )

        # 3. Check sufficient funds
        if total_deduction > current_balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient available funds to cover transfer (${amount:,.2f} USD) and wire fee (${wire_fee:,.2f} USD). Current balance: ${current_balance:,.2f} USD."
            )

        # 4. Optional Security PIN Verification
        if payload.transaction_pin:
            cur.execute("SELECT pin_hash, is_locked FROM security_credentials WHERE user_id = %s;", (user_id,))
            creds = cur.fetchone()
            if creds:
                if creds.get("is_locked"):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Security credentials temporarily locked. Please contact Private Wealth desk."
                    )
                if creds.get("pin_hash") and not AuthService.verify_secret(payload.transaction_pin, creds["pin_hash"]):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid transaction security PIN."
                    )

        new_balance = current_balance - total_deduction

        # 5. Generate Fedwire reference number
        ref_number = generate_unique_reference(cur, "FW")

        # 6. Deduct balance from account
        cur.execute(
            "UPDATE accounts SET balance = %s, updated_at = NOW() WHERE id = %s;",
            (new_balance, account_id)
        )

        # 7. Insert wire outward ledger record
        description = f"Wire Outward • {payload.recipient_name.strip()}"
        cur.execute(
            """
            INSERT INTO transactions (
                account_id,
                user_id,
                transaction_type,
                amount,
                fee,
                currency,
                description,
                counterparty_name,
                counterparty_account,
                reference_number,
                balance_after,
                status
            ) VALUES (
                %s, %s, %s, %s, %s, 'USD', %s, %s, %s, %s, %s, 'completed'
            ) RETURNING id, created_at;
            """,
            (
                account_id,
                user_id,
                "wire_out",
                amount,
                wire_fee,
                description,
                payload.recipient_name.strip(),
                payload.recipient_account.strip(),
                ref_number,
                new_balance,
            )
        )
        tx = cur.fetchone()

    return WireTransferResponse(
        transaction_id=str(tx["id"]),
        reference_number=ref_number,
        recipient_name=payload.recipient_name.strip(),
        recipient_account=payload.recipient_account.strip(),
        amount=amount,
        fee=wire_fee,
        new_balance=new_balance,
        status="completed",
        message="Fedwire real-time transfer successfully dispatched and confirmed by the Federal Reserve.",
        created_at=tx["created_at"],
    )


@router.get(
    "/transfer/pending",
    response_model=PendingWireTransferResponse,
    summary="Get active pending wire transfer session requiring clearance"
)
def get_pending_wire_transfer(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])

    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT id, amount, fee, recipient_name, recipient_account, note, current_stage, status, created_at
            FROM pending_wire_transfers
            WHERE user_id = %s;
            """,
            (user_id,)
        )
        row = cur.fetchone()

        if not row:
            return PendingWireTransferResponse(has_pending=False)

        current_stage = row["current_stage"]
        stage_info = CLEARANCE_STAGES.get(current_stage, CLEARANCE_STAGES[1])

        return PendingWireTransferResponse(
            has_pending=True,
            amount=row["amount"],
            fee=row["fee"],
            recipient_name=row["recipient_name"],
            recipient_account=row["recipient_account"],
            current_stage=current_stage,
            stage_title=stage_info["title"],
            code_name=stage_info["code_name"],
            description=stage_info["description"],
            support_email="support@nemicapbank.com",
            created_at=row["created_at"]
        )


@router.post(
    "/transfer/cancel",
    response_model=CancelPendingWireResponse,
    summary="Cancel active pending wire transfer and reset clearance codes"
)
def cancel_pending_wire_transfer(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])

    with get_db_cursor() as cur:
        # Delete pending transfer
        cur.execute("DELETE FROM pending_wire_transfers WHERE user_id = %s;", (user_id,))
        # Reset clearance codes so next transfer starts fresh at stage 1
        cur.execute("DELETE FROM wire_clearance_codes WHERE user_id = %s;", (user_id,))

    return CancelPendingWireResponse(
        status="cancelled",
        message="Pending wire transfer successfully cancelled and clearance sequence reset."
    )


@router.post(
    "/transfer/initiate",
    response_model=WireClearanceInitiateResponse,
    summary="Initiate wire transfer and retrieve required clearance code requirement"
)
def initiate_wire_clearance(
    payload: WireClearanceInitiateRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])
    amount = Decimal(str(payload.amount))
    clean_name = payload.recipient_name.strip()
    clean_account = payload.recipient_account.strip()

    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer amount must be strictly greater than $0.00."
        )

    if re.search(r"\d", clean_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipient name cannot contain numbers. Please enter letters only."
        )

    if not clean_account.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipient account number must contain numeric digits only."
        )

    with get_db_cursor() as cur:
        # Check account balance, daily limit, and wire fee
        cur.execute(
            """
            SELECT id, balance,
                   COALESCE(daily_limit, 500000.00) as daily_limit,
                   COALESCE(wire_fee, 0.00) as wire_fee
            FROM accounts WHERE user_id = %s LIMIT 1;
            """,
            (user_id,)
        )
        acc = cur.fetchone()
        if not acc:
            raise HTTPException(status_code=404, detail="No active account found for client.")
        
        current_balance = Decimal(str(acc["balance"]))
        daily_limit = Decimal(str(acc["daily_limit"]))
        wire_fee = Decimal(str(acc["wire_fee"]))
        total_deduction = amount + wire_fee

        if amount > daily_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transfer amount exceeds your daily outward transfer limit of ${daily_limit:,.2f} USD. Please contact Private Wealth desk to request a limit increase."
            )

        if total_deduction > current_balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient available funds to cover transfer (${amount:,.2f} USD) and wire fee (${wire_fee:,.2f} USD). Current balance: ${current_balance:,.2f} USD."
            )

        # Check if an existing pending wire transfer is already in progress
        cur.execute(
            """
            SELECT id, amount, fee, recipient_name, recipient_account, note, current_stage, status 
            FROM pending_wire_transfers 
            WHERE user_id = %s;
            """,
            (user_id,)
        )
        existing_pending = cur.fetchone()

        if existing_pending:
            # Transfer already active, return the current required stage details
            curr_stage = existing_pending["current_stage"]
            stage_info = CLEARANCE_STAGES.get(curr_stage, CLEARANCE_STAGES[1])
            return WireClearanceInitiateResponse(
                status="clearance_required",
                stage=stage_info["stage_number"],
                title=stage_info["title"],
                code_name=stage_info["code_name"],
                description=stage_info["description"],
                support_email="support@nemicapbank.com"
            )

        # Fresh transfer: create pending_wire_transfers record
        cur.execute(
            """
            INSERT INTO pending_wire_transfers (
                user_id, account_id, amount, fee, recipient_name, recipient_account, note, current_stage, status
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, 1, 'pending_clearance'
            );
            """,
            (user_id, acc["id"], amount, wire_fee, payload.recipient_name.strip(), payload.recipient_account.strip(), payload.note)
        )

        # Check existing clearance codes for user
        cur.execute(
            """
            SELECT id, stage_number, code, is_used 
            FROM wire_clearance_codes 
            WHERE user_id = %s 
            ORDER BY stage_number ASC;
            """,
            (user_id,)
        )
        existing_codes = cur.fetchall()

        # If user has no clearance codes or all are used, provision 3 fresh codes
        if not existing_codes or all(c["is_used"] for c in existing_codes):
            if existing_codes:
                cur.execute("DELETE FROM wire_clearance_codes WHERE user_id = %s;", (user_id,))
            
            for st in [1, 2, 3]:
                gen_code = f"{random.randint(100000, 999999)}"
                info = CLEARANCE_STAGES[st]
                cur.execute(
                    """
                    INSERT INTO wire_clearance_codes (user_id, stage_number, code_name, code, is_used)
                    VALUES (%s, %s, %s, %s, FALSE);
                    """,
                    (user_id, st, info["code_name"], gen_code)
                )

        stage_info = CLEARANCE_STAGES[1]
        return WireClearanceInitiateResponse(
            status="clearance_required",
            stage=stage_info["stage_number"],
            title=stage_info["title"],
            code_name=stage_info["code_name"],
            description=stage_info["description"],
            support_email="support@nemicapbank.com"
        )


@router.post(
    "/transfer/verify-stage",
    response_model=WireClearanceVerifyResponse,
    summary="Verify 6-digit clearance code for active stage and progress or dispatch"
)
def verify_wire_clearance_stage(
    payload: WireClearanceVerifyRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])
    clean_code = payload.code.strip()
    amount = Decimal(str(payload.amount))

    with get_db_cursor() as cur:
        # Check active account
        cur.execute(
            """
            SELECT id, account_number, balance,
                   COALESCE(daily_limit, 500000.00) as daily_limit,
                   COALESCE(wire_fee, 0.00) as wire_fee
            FROM accounts WHERE user_id = %s LIMIT 1;
            """,
            (user_id,)
        )
        acc = cur.fetchone()
        if not acc:
            raise HTTPException(status_code=404, detail="No active account found for client.")

        account_id = acc["id"]
        current_balance = Decimal(str(acc["balance"]))
        daily_limit = Decimal(str(acc["daily_limit"]))
        wire_fee = Decimal(str(acc["wire_fee"]))
        total_deduction = amount + wire_fee

        if amount > daily_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transfer amount exceeds your daily outward transfer limit of ${daily_limit:,.2f} USD. Please contact Private Wealth desk to request a limit increase."
            )

        if total_deduction > current_balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient available funds to cover transfer (${amount:,.2f} USD) and wire fee (${wire_fee:,.2f} USD). Current balance: ${current_balance:,.2f} USD."
            )

        # Check matching code for this user and stage
        cur.execute(
            """
            SELECT id, code, is_used FROM wire_clearance_codes
            WHERE user_id = %s AND stage_number = %s AND is_used = FALSE;
            """,
            (user_id, payload.stage)
        )
        code_row = cur.fetchone()

        if not code_row or code_row["code"] != clean_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid clearance key. Please contact Private Wealth Support to obtain your authorized 6-digit code."
            )

        # Mark this stage code as used
        cur.execute(
            "UPDATE wire_clearance_codes SET is_used = TRUE, used_at = NOW() WHERE id = %s;",
            (code_row["id"],)
        )

        # If Stage 1 cleared -> Advance pending_wire_transfers to Stage 2
        if payload.stage == 1:
            cur.execute(
                "UPDATE pending_wire_transfers SET current_stage = 2, updated_at = NOW() WHERE user_id = %s;",
                (user_id,)
            )
            next_info = CLEARANCE_STAGES[2]
            return WireClearanceVerifyResponse(
                status="next_stage_required",
                stage=2,
                title=next_info["title"],
                code_name=next_info["code_name"],
                description=next_info["description"],
                support_email="support@nemicapbank.com"
            )

        # If Stage 2 cleared -> Advance pending_wire_transfers to Stage 3
        if payload.stage == 2:
            cur.execute(
                "UPDATE pending_wire_transfers SET current_stage = 3, updated_at = NOW() WHERE user_id = %s;",
                (user_id,)
            )
            next_info = CLEARANCE_STAGES[3]
            return WireClearanceVerifyResponse(
                status="next_stage_required",
                stage=3,
                title=next_info["title"],
                code_name=next_info["code_name"],
                description=next_info["description"],
                support_email="support@nemicapbank.com"
            )

        # Stage 3 cleared -> COMPLETE WIRE DISPATCH
        new_balance = current_balance - total_deduction
        ref_number = generate_unique_reference(cur, "FW")

        # Deduct balance
        cur.execute("UPDATE accounts SET balance = %s, updated_at = NOW() WHERE id = %s;", (new_balance, account_id))

        # Insert transaction record
        description = f"Wire Outward • {payload.recipient_name.strip()}"
        cur.execute(
            """
            INSERT INTO transactions (
                account_id,
                user_id,
                transaction_type,
                amount,
                fee,
                currency,
                description,
                counterparty_name,
                counterparty_account,
                reference_number,
                balance_after,
                status
            ) VALUES (
                %s, %s, 'wire_out', %s, %s, 'USD', %s, %s, %s, %s, %s, 'completed'
            ) RETURNING id, created_at;
            """,
            (
                account_id,
                user_id,
                amount,
                wire_fee,
                description,
                payload.recipient_name.strip(),
                payload.recipient_account.strip(),
                ref_number,
                new_balance,
            )
        )
        tx = cur.fetchone()

        # Delete active pending wire record now that transfer is finalized
        cur.execute("DELETE FROM pending_wire_transfers WHERE user_id = %s;", (user_id,))

        tx_response = WireTransferResponse(
            transaction_id=str(tx["id"]),
            reference_number=ref_number,
            recipient_name=payload.recipient_name.strip(),
            recipient_account=payload.recipient_account.strip(),
            amount=amount,
            fee=wire_fee,
            new_balance=new_balance,
            status="completed",
            message="Fedwire real-time transfer successfully dispatched and confirmed by the Federal Reserve.",
            created_at=tx["created_at"],
        )

        return WireClearanceVerifyResponse(
            status="completed",
            transaction=tx_response
        )



@router.get(
    "",
    response_model=TransactionListResponse,
    summary="List client transaction history with optional filters"
)
def list_transactions(
    filter_type: str = Query("all", pattern="^(all|inflow|outflow)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])

    with get_db_cursor() as cur:
        # Fetch account info
        cur.execute(
            """
            SELECT id, account_number, balance 
            FROM accounts 
            WHERE user_id = %s 
            ORDER BY created_at ASC 
            LIMIT 1;
            """,
            (user_id,)
        )
        account = cur.fetchone()

        if not account:
            return TransactionListResponse(
                account_number="N/A",
                current_balance=Decimal("0.00"),
                total_count=0,
                transactions=[]
            )

        account_id = account["id"]

        # Build filter clause
        type_filter = ""
        params = [account_id]

        if filter_type == "inflow":
            type_filter = "AND transaction_type IN ('deposit_ach', 'wire_in', 'yield_credit')"
        elif filter_type == "outflow":
            type_filter = "AND transaction_type IN ('wire_out', 'card_purchase')"

        # Count total
        cur.execute(
            f"SELECT COUNT(*) as count FROM transactions WHERE account_id = %s {type_filter};",
            tuple(params)
        )
        total_count = cur.fetchone()["count"]

        # Fetch records
        cur.execute(
            f"""
            SELECT 
                id,
                account_id,
                transaction_type,
                amount,
                fee,
                currency,
                description,
                counterparty_name,
                counterparty_account,
                reference_number,
                balance_after,
                status,
                created_at
            FROM transactions
            WHERE account_id = %s {type_filter}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s;
            """,
            (account_id, limit, offset)
        )
        rows = cur.fetchall()

    items = [
        TransactionItemResponse(
            id=str(r["id"]),
            account_id=str(r["account_id"]),
            transaction_type=r["transaction_type"],
            amount=Decimal(str(r["amount"])),
            fee=Decimal(str(r.get("fee") or "0.00")),
            currency=r.get("currency") or "USD",
            description=r["description"],
            counterparty_name=r.get("counterparty_name"),
            counterparty_account=r.get("counterparty_account"),
            reference_number=r.get("reference_number") or f"REF-{str(r['id'])[:8]}",
            balance_after=Decimal(str(r["balance_after"])) if r.get("balance_after") is not None else None,
            status=r.get("status") or "completed",
            created_at=r["created_at"],
        )
        for r in rows
    ]

    return TransactionListResponse(
        account_number=account["account_number"],
        current_balance=Decimal(str(account["balance"])),
        total_count=total_count,
        transactions=items,
    )
