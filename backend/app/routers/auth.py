from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import (
    signup,
    login,
    create_token,
    get_current_user,
)
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and return JWT token."""
    try:
        user = signup(db, data.name, data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    token = create_token(user.id)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def authenticate(data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password, return JWT token."""
    try:
        user = login(db, data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    token = create_token(user.id)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return UserResponse.model_validate(current_user)
