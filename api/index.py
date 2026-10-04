from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config import settings
from api.routers import (
    health_router,
    auth_router,
    storage_router,
    kyc_router,
    accounts_router,
    users_router,
    transactions_router,
    admin_router,
    contact_router,
)

# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="High-security institutional banking API for NemiCapital International Bank.",
    docs_url="/api/py/docs",
    redoc_url="/api/py/redoc",
    openapi_url="/api/py/openapi.json",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(storage_router)
app.include_router(kyc_router)
app.include_router(accounts_router)
app.include_router(users_router)
app.include_router(transactions_router)
app.include_router(admin_router)
app.include_router(contact_router)


@app.get("/")
def root_redirect():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/api/py/docs",
        "health": "/api/py/health",
    }
