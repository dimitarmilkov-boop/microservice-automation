"""
X Auth Service - Main FastAPI Application

Browser automation service for X (Twitter) OAuth and account management.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os
from datetime import datetime

# Add project root to path for shared imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from shared.logging_config import setup_logging
from shared.exceptions import AutomationServiceException
from app.config import settings
from app.api.v1.router import api_router


# ============================================================================
# Lifespan Events
# ============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup and shutdown.
    """
    # Startup
    logger.info("Starting X Auth Service", extra={"version": settings.service_version})
    logger.info(
        "Configuration loaded",
        extra={
            "environment": settings.environment,
            "debug": settings.debug,
            "port": settings.port,
        },
    )

    yield

    # Shutdown
    logger.info("Shutting down X Auth Service")


# ============================================================================
# Application Setup
# ============================================================================

# Setup logging
logger = setup_logging(
    service_name=settings.service_name,
    log_level=settings.log_level,
    log_format=settings.log_format,
)

# Create FastAPI app
app = FastAPI(
    title="X Auth Service",
    description="Browser automation service for X (Twitter) OAuth and account management",
    version=settings.service_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ============================================================================
# Middleware
# ============================================================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests."""
    logger.info(
        "Incoming request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else None,
        },
    )

    response = await call_next(request)

    logger.info(
        "Request completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
        },
    )

    return response


# ============================================================================
# Exception Handlers
# ============================================================================


@app.exception_handler(AutomationServiceException)
async def automation_exception_handler(request: Request, exc: AutomationServiceException):
    """Handle custom automation service exceptions."""
    logger.error(
        "Automation service error",
        extra={
            "error_code": exc.error_code,
            "error_message": exc.message,
            "path": request.url.path,
        },
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": exc.error_code,
            "error_message": exc.message,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    logger.error(
        "Unhandled exception",
        extra={
            "error": str(exc),
            "path": request.url.path,
        },
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_ERROR",
            "error_message": "An unexpected error occurred",
        },
    )


# ============================================================================
# Include Routers
# ============================================================================

app.include_router(api_router, prefix="/api/v1")


# ============================================================================
# Root Endpoint
# ============================================================================


@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": settings.service_name,
        "version": settings.service_version,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "docs": "/docs",
    }


# ============================================================================
# Main Entry Point (for development)
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
