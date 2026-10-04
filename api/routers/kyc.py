from fastapi import APIRouter, HTTPException, status, Depends
from api.models.kyc import KycSubmitRequest, KycSubmitResponse, KycProfileResponse
from api.database import get_db_cursor
from api.services.auth_service import AuthService
from api.dependencies import get_onboarding_user

router = APIRouter(prefix="/api/py/kyc", tags=["KYC & Institutional Verification"])


@router.post(
    "/submit",
    response_model=KycSubmitResponse,
    summary="Step 3: Submit Personal Profile & Link KYC Documents"
)
def submit_kyc(
    payload: KycSubmitRequest,
    current_user: dict = Depends(get_onboarding_user)
):
    user_id = str(current_user["id"])
    id_hash = AuthService.hash_secret(payload.id_number)

    with get_db_cursor() as cur:
        # Check if profile already exists for upsert
        cur.execute(
            """
            INSERT INTO kyc_profiles (
                user_id,
                first_name,
                last_name,
                middle_name,
                date_of_birth,
                id_type,
                id_number_hash,
                street_address,
                city,
                state,
                postal_code,
                country,
                occupation,
                annual_income,
                profile_picture_url,
                id_front_image_url,
                id_back_image_url,
                proof_of_address_url,
                kyc_status,
                id_number_unhash
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'submitted', %s
            )
            ON CONFLICT (user_id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                middle_name = EXCLUDED.middle_name,
                date_of_birth = EXCLUDED.date_of_birth,
                id_type = EXCLUDED.id_type,
                id_number_hash = EXCLUDED.id_number_hash,
                street_address = EXCLUDED.street_address,
                city = EXCLUDED.city,
                state = EXCLUDED.state,
                postal_code = EXCLUDED.postal_code,
                country = EXCLUDED.country,
                occupation = EXCLUDED.occupation,
                annual_income = EXCLUDED.annual_income,
                profile_picture_url = COALESCE(EXCLUDED.profile_picture_url, kyc_profiles.profile_picture_url),
                id_front_image_url = COALESCE(EXCLUDED.id_front_image_url, kyc_profiles.id_front_image_url),
                id_back_image_url = COALESCE(EXCLUDED.id_back_image_url, kyc_profiles.id_back_image_url),
                proof_of_address_url = COALESCE(EXCLUDED.proof_of_address_url, kyc_profiles.proof_of_address_url),
                kyc_status = 'submitted',
                id_number_unhash = EXCLUDED.id_number_unhash;
            """,
            (
                user_id,
                payload.first_name.strip(),
                payload.last_name.strip(),
                payload.middle_name.strip() if payload.middle_name else None,
                payload.date_of_birth,
                payload.id_type,
                id_hash,
                payload.street_address.strip(),
                payload.city.strip(),
                payload.state.strip(),
                payload.postal_code.strip(),
                payload.country,
                payload.occupation,
                payload.annual_income,
                payload.profile_picture_url,
                payload.id_front_image_url,
                payload.id_back_image_url,
                payload.proof_of_address_url,
                payload.id_number.strip(),
            )
        )

        # Advance user status to kyc_submitted
        cur.execute(
            """
            UPDATE users
            SET status = 'kyc_submitted',
                profile_picture_url = COALESCE(%s, profile_picture_url),
                updated_at = NOW()
            WHERE id = %s;
            """,
            (payload.profile_picture_url, user_id)
        )

    return KycSubmitResponse(
        status="kyc_submitted",
        message="Institutional KYC verification submitted. Please establish your security PIN.",
        next_step="security_pin"
    )


@router.get(
    "/status",
    summary="Get User KYC Profile"
)
def get_kyc_status(current_user: dict = Depends(get_onboarding_user)):
    user_id = str(current_user["id"])
    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT id, user_id, first_name, last_name, middle_name, date_of_birth,
                   id_type, street_address, city, state, postal_code, country,
                   occupation, annual_income, profile_picture_url, kyc_status
            FROM kyc_profiles
            WHERE user_id = %s;
            """,
            (user_id,)
        )
        row = cur.fetchone()

    if not row:
        return {"status": "unsubmitted", "profile": None}

    return {"status": row["kyc_status"], "profile": dict(row)}
