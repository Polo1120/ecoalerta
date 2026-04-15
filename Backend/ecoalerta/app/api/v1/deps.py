import uuid
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import CredentialsException, ForbiddenException
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the Bearer token and return the authenticated User.
    Raises 401 if the token is invalid or the user no longer exists.
    """
    token = credentials.credentials
    user_id = decode_access_token(token)
    if user_id is None:
        raise CredentialsException()

    user = db.get(User, uuid.UUID(user_id))
    if user is None or not user.is_active:
        raise CredentialsException()

    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Restrict access to users with the *admin* role."""
    if current_user.role != UserRole.admin:
        raise ForbiddenException("Admin privileges required.")
    return current_user
