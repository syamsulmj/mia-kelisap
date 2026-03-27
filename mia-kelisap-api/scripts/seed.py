"""Seed script for development data."""

import asyncio

from mia_kelisap.core.security import hash_password
from mia_kelisap.database import async_session
from mia_kelisap.models.user import User
from mia_kelisap.models.user_settings import UserSettings


async def seed() -> None:
    async with async_session() as db:
        user = User(
            email="dev@example.com",
            hashed_password=hash_password("password123"),
            name="Dev User",
        )
        db.add(user)
        await db.flush()

        db.add(UserSettings(user_id=user.id))
        await db.commit()
        print(f"Created dev user: {user.email} (id: {user.id})")


if __name__ == "__main__":
    asyncio.run(seed())
