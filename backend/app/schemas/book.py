from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

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
    title: str = Field(..., min_length=1)
    author_name: str = Field(..., min_length=1) 
    genre: str = Field(..., min_length=1)
    publish_year: int = Field(...)              
    cover_url: Optional[str] = None
    description: Optional[str] = None
    author_bio: Optional[str] = None
    subjects: Optional[List[str]] = [] # <--- FIXED: Strictly enforce this is a List

    @field_validator('publish_year')
    @classmethod
    def validate_publish_year(cls, v):
        if v < 1000 or v > 2100:
            raise ValueError("Publish year must be a valid year between 1000 and 2100")
        return v

class PaginatedBooksResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[BookSchema]
    
    class Config:
        from_attributes = True