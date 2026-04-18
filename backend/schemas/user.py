from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    age: int
    gender: str
    location: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: EmailStr
    age: int | None = None
    gender: str | None = None
    location: str | None = None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str
