from fastapi import APIRouter, HTTPException, status

from mia_kelisap.api.auth.schemas import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserResponse,
)
from mia_kelisap.api.auth.service import AuthService
from mia_kelisap.dependencies import DB, CurrentUser

router = APIRouter()


@router.post(
    "/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
async def signup(data: SignupRequest, db: DB) -> AuthResponse:
    try:
        return await AuthService.signup(db, data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: DB) -> AuthResponse:
    try:
        return await AuthService.login(db, data.email, data.password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)
        ) from e


@router.get("/me", response_model=UserResponse)
async def me(user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(user)
