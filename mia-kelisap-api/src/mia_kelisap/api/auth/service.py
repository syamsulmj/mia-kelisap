from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mia_kelisap.api.auth.schemas import AuthResponse, SignupRequest
from mia_kelisap.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from mia_kelisap.models.user import User
from mia_kelisap.models.user_settings import UserSettings


class AuthService:
    @staticmethod
    async def signup(db: AsyncSession, data: SignupRequest) -> AuthResponse:
        stmt = select(User).where(User.email == data.email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")

        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            name=data.name,
        )
        db.add(user)
        await db.flush()

        db.add(UserSettings(user_id=user.id))
        await db.flush()

        token = create_access_token(subject=user.id)
        return AuthResponse(access_token=token)

    @staticmethod
    async def login(db: AsyncSession, email: str, password: str) -> AuthResponse:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        token = create_access_token(subject=user.id)
        return AuthResponse(access_token=token)
