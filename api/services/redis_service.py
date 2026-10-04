import random
import redis
from api.config import settings

_redis_client: redis.Redis | None = None


def get_redis_client() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
    return _redis_client


class RedisService:
    @staticmethod
    def generate_otp() -> str:
        """Generates a secure 6-digit numerical OTP code."""
        return f"{random.randint(100000, 999999)}"

    @staticmethod
    def store_otp(email: str, otp_code: str, ttl_seconds: int = 300) -> bool:
        """Stores a 6-digit OTP code in Redis with an expiration TTL."""
        client = get_redis_client()
        key = f"otp:email:{email.lower().strip()}"
        client.set(key, otp_code, ex=ttl_seconds)
        # Store rate limit timestamp
        client.set(f"otp:ratelimit:{email.lower().strip()}", "1", ex=60)
        return True

    @staticmethod
    def verify_otp(email: str, submitted_code: str, delete_on_success: bool = True) -> bool:
        """Verifies the submitted OTP against Redis. Deletes on success to prevent replay."""
        client = get_redis_client()
        key = f"otp:email:{email.lower().strip()}"
        stored_code = client.get(key)
        if not stored_code:
            return False
        
        if stored_code.strip() == submitted_code.strip():
            if delete_on_success:
                client.delete(key)
            return True
        return False

    @staticmethod
    def is_rate_limited(email: str) -> bool:
        """Returns True if user requested an OTP within the last 60 seconds."""
        client = get_redis_client()
        key = f"otp:ratelimit:{email.lower().strip()}"
        return client.exists(key) == 1
