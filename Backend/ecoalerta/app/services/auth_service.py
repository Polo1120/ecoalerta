from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, CredentialsException
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserPublic


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def register(self, payload: UserCreate) -> UserPublic:
        """
        Create a new user account.
        Raises 409 if the e-mail address is already taken.
        """
        existing = self.db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise ConflictException("A user with this email already exists.")

        user = User(
            name=payload.name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return UserPublic.model_validate(user)

    def login(self, payload: UserLogin) -> TokenResponse:
        """
        Authenticate a user and return a JWT access token.
        Raises 401 on invalid credentials.
        """
        user = self.db.query(User).filter(User.email == payload.email).first()
        if not user or not verify_password(payload.password, user.hashed_password):
            raise CredentialsException()

        token = create_access_token(subject=user.id)
        return TokenResponse(
            access_token=token,
            user=UserPublic.model_validate(user),
        )
