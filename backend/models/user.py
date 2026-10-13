from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=64)

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime
    total_practice_time_seconds: int = 0
    daily_streak: int = 0
    last_active_date: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
