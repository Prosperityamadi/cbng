import json
import urllib.request
import urllib.error
from typing import Dict, Any, List
from api.config import settings


class StorageService:
    @staticmethod
    def upload_file(
        file_bytes: bytes,
        file_path: str,
        bucket_name: str,
        content_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        """
        Uploads a file to Supabase Storage using the service role key.
        Works for both public ('profile-pictures') and private ('kyc-documents') buckets.
        """
        base_url = settings.SUPABASE_URL.rstrip('/')
        url = f"{base_url}/storage/v1/object/{bucket_name}/{file_path}"

        req = urllib.request.Request(
            url,
            data=file_bytes,
            method="POST",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": content_type,
                "x-upsert": "true"
            }
        )

        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                
                # If public bucket, build public URL
                public_url = (
                    f"{base_url}/storage/v1/object/public/{bucket_name}/{file_path}"
                    if bucket_name == settings.SUPABASE_STORAGE_BUCKET_PROFILE
                    else ""
                )

                return {
                    "key": result.get("Key", f"{bucket_name}/{file_path}"),
                    "id": result.get("Id", ""),
                    "bucket": bucket_name,
                    "path": file_path,
                    "public_url": public_url,
                    "content_type": content_type,
                    "size_bytes": len(file_bytes)
                }
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            raise RuntimeError(f"Supabase Storage Upload Error ({e.code}): {error_body}")

    @staticmethod
    def create_signed_url(bucket_name: str, file_path: str, expires_in: int = 900) -> str:
        """
        Generates a secure, time-limited signed URL for private bucket objects.
        Default expiration: 15 minutes (900s).
        """
        base_url = settings.SUPABASE_URL.rstrip('/')
        url = f"{base_url}/storage/v1/object/sign/{bucket_name}/{file_path}"

        body = json.dumps({"expiresIn": expires_in}).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=body,
            method="POST",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                signed_path = result.get("signedURL", "")
                return f"{base_url}/storage/v1{signed_path}"
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            raise RuntimeError(f"Supabase Signed URL Error ({e.code}): {error_body}")

    @staticmethod
    def delete_files(bucket_name: str, file_paths: List[str]) -> bool:
        """Deletes files from a Supabase Storage bucket."""
        base_url = settings.SUPABASE_URL.rstrip('/')
        url = f"{base_url}/storage/v1/object/{bucket_name}"

        body = json.dumps({"prefixes": file_paths}).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=body,
            method="DELETE",
            headers={
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req) as response:
                return response.status == 200
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            raise RuntimeError(f"Supabase Delete Error ({e.code}): {error_body}")
