from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserPublic
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserPublic:
    """
    Create a new user with **user** role.

    - **name**: Full name (2–100 characters)
    - **email**: Must be unique across all accounts
    - **password**: Minimum 8 characters, must contain at least one digit
    """
    return AuthService(db).register(payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and obtain a JWT access token",
)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    """
    Authenticate with email + password.
    Returns a **Bearer** token to include in subsequent requests:
    `Authorization: Bearer <token>`
    """
    return AuthService(db).login(payload)
