from pydantic import BaseModel
from typing import Optional


class StorageUploadResponse(BaseModel):
    url: str
    bucket: str
    path: str
    file_name: str
    content_type: str
    size_bytes: int
    is_public: bool


class SignedUrlResponse(BaseModel):
    signed_url: str
    expires_in: int = 900
