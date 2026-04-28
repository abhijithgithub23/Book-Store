from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- USER SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- BOOK SCHEMAS ---
class BookSchema(BaseModel):
    id: str
    title: str
    genre: str
    publish_year: str
    cover_url: Optional[str]
    description: str
    author_name: str
    author_bio: str
    subjects: Optional[List[str]] = []
    class Config:
        from_attributes = True

# --- CART SCHEMAS ---
class CartItemResponse(BaseModel):
    id: int
    book: BookSchema
    class Config:
        from_attributes = True