from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import RequestLoggingMiddleware, setup_logging
from app.core.exceptions import (
    ConflictException,
    CredentialsException,
    ForbiddenException,
    NotFoundException,
)
from app.db.session import engine


def create_tables() -> None:
    """
    Create all database tables from ORM metadata.
    In production use Alembic migrations instead.
    """
    import app.db.base  # noqa: F401 – registers User & Report models
    from app.db.base_class import Base
    Base.metadata.create_all(bind=engine)


def build_app() -> FastAPI:
    """Construct and configure the FastAPI application instance."""
    app = FastAPI(
        title="EcoAlerta API",
        description=(
            "Geolocated reporting system for urban waste issues. "
            "Citizens can report waste problems; admins manage resolution."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    setup_logging(debug=settings.DEBUG)
    app.add_middleware(RequestLoggingMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.get("/health", tags=["Health"], summary="Service health check")
    def health() -> dict:
        return {"status": "ok", "environment": settings.APP_ENV}

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()},
        )

    @app.exception_handler(CredentialsException)
    @app.exception_handler(ForbiddenException)
    @app.exception_handler(NotFoundException)
    @app.exception_handler(ConflictException)
    async def http_exception_handler(request: Request, exc) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Catch-all handler that prevents raw tracebacks leaking to clients."""
        if settings.DEBUG:
            raise exc  # let FastAPI's default handler show the traceback in dev
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred. Please try again later."},
        )

    @app.on_event("startup")
    def startup() -> None:
        if settings.APP_ENV != "production":
            create_tables()

    return app


app = build_app()