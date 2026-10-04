from api.routers.auth import router as auth_router
from api.routers.storage import router as storage_router
from api.routers.kyc import router as kyc_router
from api.routers.accounts import router as accounts_router
from api.routers.health import router as health_router
from api.routers.users import users_router
from api.routers.transactions import router as transactions_router
from api.routers.admin import router as admin_router
from api.routers.contact import router as contact_router

__all__ = [
    "auth_router",
    "storage_router",
    "kyc_router",
    "accounts_router",
    "health_router",
    "users_router",
    "transactions_router",
    "admin_router",
    "contact_router",
]
