from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI instance
# docs_url="/api/py/docs" maps the Swagger UI cleanly under /api/py
app = FastAPI(
    title="FastAPI Backend",
    version="1.0.0",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/py/health")
def health_check():
    """Health check endpoint to verify backend environment readiness."""
    return {
        "status": "healthy",
        "service": "FastAPI Backend",
        "ready": True,
        "message": "FastAPI is up and running in your Next.js project!",
    }


@app.get("/api/py/status")
def status_info():
    """Returns basic environment status and planned service integrations."""
    return {
        "environment": "ready",
        "database_target": "Supabase (PostgreSQL)",
        "cache_target": "Redis",
        "deployment": "Vercel Serverless Function",
    }
