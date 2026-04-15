from fastapi import APIRouter, Depends

from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserPublic

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Get current authenticated user profile",
)
def get_me(current_user: User = Depends(get_current_user)) -> UserPublic:
    """Return the profile of the currently authenticated user."""
    return UserPublic.model_validate(current_user)
