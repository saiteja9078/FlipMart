"""
Authentication service — handles signup, login, and JWT token management.
"""

import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.config import get_settings

security = HTTPBearer(auto_error=False)

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72  # 3 days


def _get_secret() -> str:
    return get_settings().JWT_SECRET


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, _get_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> int:
    """Decode JWT and return user_id. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, _get_secret(), algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def signup(db: Session, name: str, email: str, password: str) -> User:
    """Create a new user. Raises ValueError if email taken."""
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("Email already registered")

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(db: Session, email: str, password: str) -> User:
    """Verify credentials and return user. Raises ValueError on mismatch."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")
    return user


# ---------- FastAPI dependencies ----------

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Required auth dependency — raises 401 if not authenticated."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = decode_token(credentials.credentials)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    """Optional auth — returns None if not authenticated (no error)."""
    if not credentials:
        return None
    try:
        user_id = decode_token(credentials.credentials)
        return db.query(User).filter(User.id == user_id).first()
    except HTTPException:
        return None
