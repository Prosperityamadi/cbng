from fastapi import APIRouter
from api.database import get_db_cursor
from api.services.redis_service import get_redis_client
from api.config import settings

router = APIRouter(tags=["Health & Diagnostics"])


@router.get("/api/py/health")
def health_check():
    """Live health check endpoint testing both PostgreSQL and Redis connections."""
    db_status = "unreachable"
    redis_status = "unreachable"

    # Test PostgreSQL
    try:
        with get_db_cursor() as cur:
            cur.execute("SELECT 1;")
            cur.fetchone()
            db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Test Redis
    try:
        r = get_redis_client()
        if r.ping():
            redis_status = "connected"
    except Exception as e:
        redis_status = f"error: {str(e)}"

    overall_ready = db_status == "connected" and redis_status == "connected"

    return {
        "status": "healthy" if overall_ready else "degraded",
        "service": settings.APP_NAME,
        "ready": overall_ready,
        "database": {
            "target": "PostgreSQL (Supabase)",
            "status": db_status,
        },
        "cache": {
            "target": "Redis (Upstash)",
            "status": redis_status,
        },
    }


@router.get("/api/py/status")
def status_info():
    """Environment configuration summary."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database_configured": bool(settings.DATABASE_URL),
        "redis_configured": bool(settings.REDIS_URL),
        "resend_configured": bool(settings.RESEND_API_KEY),
        "storage_configured": bool(settings.SUPABASE_SERVICE_ROLE_KEY),
        "senders": {
            "verify": settings.EMAIL_FROM_VERIFY,
            "welcome": settings.EMAIL_FROM_WELCOME,
            "reply_to": settings.EMAIL_REPLY_TO,
        }
    }
