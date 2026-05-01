from pydantic import BaseModel
from typing import List, Optional

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

class BookCreate(BaseModel):
    id: Optional[str] = None
    title: str
    genre: str
    publish_year: str
    cover_url: Optional[str] = None
    description: str
    author_name: str
    author_bio: str
    subjects: Optional[List[str]] = []

class PaginatedBooksResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[BookSchema]
    class Config:
        from_attributes = True