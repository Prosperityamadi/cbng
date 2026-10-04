import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from api.models.storage import StorageUploadResponse, SignedUrlResponse
from api.services.storage_service import StorageService
from api.dependencies import get_onboarding_user
from api.database import get_db_cursor
from api.config import settings

router = APIRouter(prefix="/api/py/storage", tags=["Object Storage"])

ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5MB

ALLOWED_KYC_TYPES = ["image/jpeg", "image/png", "application/pdf"]
MAX_KYC_BYTES = 15 * 1024 * 1024  # 15MB


@router.post(
    "/upload-avatar",
    response_model=StorageUploadResponse,
    summary="Upload Client Avatar / Profile Picture"
)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_onboarding_user)
):
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format: {file.content_type}. Allowed: JPEG, PNG, WEBP.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 5MB maximum limit.",
        )

    user_id = str(current_user["id"])
    ext = file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else "jpg"
    new_file_path = f"avatars/{user_id}_{int(time.time())}.{ext}"

    # 1. Fetch old avatar path from DB
    old_file_path = None
    with get_db_cursor() as cur:
        cur.execute("SELECT profile_picture_url FROM users WHERE id = %s;", (user_id,))
        user_record = cur.fetchone()
        if user_record and user_record["profile_picture_url"]:
            old_url = user_record["profile_picture_url"]
            # If it's a full public URL, extract the path, else it's already the path
            if "object/public" in old_url:
                old_file_path = old_url.split(f"{settings.SUPABASE_STORAGE_BUCKET_PROFILE}/")[-1]
            elif not old_url.startswith("http") and not old_url.startswith("/api/py/"):
                old_file_path = old_url

    # 2. Upload new file
    try:
        StorageService.upload_file(
            file_bytes=file_bytes,
            file_path=new_file_path,
            bucket_name=settings.SUPABASE_STORAGE_BUCKET_PROFILE,
            content_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage upload failed: {str(e)}",
        )

    # 3. Delete old file if it exists
    if old_file_path:
        try:
            StorageService.delete_files(settings.SUPABASE_STORAGE_BUCKET_PROFILE, [old_file_path])
        except Exception as e:
            print(f"[Warning] Failed to delete old avatar {old_file_path}: {e}")

    # 4. Save raw file path to DB
    internal_endpoint = f"/api/py/storage/avatars/{user_id}?v={int(time.time())}"
    with get_db_cursor() as cur:
        cur.execute(
            "UPDATE users SET profile_picture_url = %s, updated_at = NOW() WHERE id = %s;",
            (new_file_path, user_id)  # Save the raw path
        )

    return StorageUploadResponse(
        url=internal_endpoint,
        bucket=settings.SUPABASE_STORAGE_BUCKET_PROFILE,
        path=new_file_path,
        file_name=file.filename or new_file_path,
        content_type=file.content_type,
        size_bytes=len(file_bytes),
        is_public=False
    )

from fastapi.responses import Response
import urllib.request as _urllib_request
import urllib.error as _urllib_error

@router.get("/avatars/{user_id}", summary="Serve User Avatar (Proxied from Storage)")
def get_user_avatar(user_id: str, v: str = None):
    with get_db_cursor() as cur:
        cur.execute("SELECT profile_picture_url FROM users WHERE id = %s;", (user_id,))
        user = cur.fetchone()
        
    if not user or not user["profile_picture_url"]:
        raise HTTPException(status_code=404, detail="Avatar not found")
        
    file_path = user["profile_picture_url"]
    
    # Build the direct public URL for the profile-pictures bucket
    base_url = settings.SUPABASE_URL.rstrip('/')
    bucket = settings.SUPABASE_STORAGE_BUCKET_PROFILE
    image_url = f"{base_url}/storage/v1/object/{bucket}/{file_path}"
    
    try:
        req = _urllib_request.Request(
            image_url,
            method="GET",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            }
        )
        with _urllib_request.urlopen(req) as resp:
            image_bytes = resp.read()
            content_type = resp.headers.get("Content-Type", "image/jpeg")
            return Response(
                content=image_bytes,
                media_type=content_type,
                headers={"Cache-Control": "public, max-age=3600"}
            )
    except _urllib_error.HTTPError as e:
        raise HTTPException(status_code=e.code, detail=f"Storage error: {e.reason}")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch avatar")


@router.post(
    "/upload-kyc",
    response_model=StorageUploadResponse,
    summary="Upload Sensitive KYC Document (Private Encrypted Bucket)"
)
async def upload_kyc_document(
    file: UploadFile = File(...),
    document_type: str = Form("id_front"),
    current_user: dict = Depends(get_onboarding_user)
):
    if file.content_type not in ALLOWED_KYC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported document format: {file.content_type}. Allowed: JPEG, PNG, PDF.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_KYC_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 15MB limit.",
        )

    user_id = str(current_user["id"])
    ext = file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else "jpg"
    clean_doc_type = document_type.strip().lower()
    file_path = f"{user_id}/{clean_doc_type}_{int(time.time())}.{ext}"

    try:
        upload_result = StorageService.upload_file(
            file_bytes=file_bytes,
            file_path=file_path,
            bucket_name=settings.KYC_STORAGE_BUCKET,
            content_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"KYC document upload failed: {str(e)}",
        )

    return StorageUploadResponse(
        url=f"{settings.KYC_STORAGE_BUCKET}/{file_path}",
        bucket=settings.KYC_STORAGE_BUCKET,
        path=file_path,
        file_name=file.filename or file_path,
        content_type=file.content_type,
        size_bytes=len(file_bytes),
        is_public=False
    )


@router.get(
    "/kyc-signed-url",
    response_model=SignedUrlResponse,
    summary="Generate Temporary Signed URL for Private KYC Document"
)
def get_kyc_signed_url(
    file_path: str,
    expires_in: int = 900,
    current_user: dict = Depends(get_onboarding_user)
):
    try:
        signed_url = StorageService.create_signed_url(
            bucket_name=settings.KYC_STORAGE_BUCKET,
            file_path=file_path,
            expires_in=expires_in
        )
        return SignedUrlResponse(signed_url=signed_url, expires_in=expires_in)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate signed URL: {str(e)}"
        )
