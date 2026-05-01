from pydantic import BaseModel, Field, field_validator
from typing import Optional, Union, List
from datetime import datetime
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
    title: str = Field(..., min_length=1)
    # Matches the exact payload key from your log
    author_name: str = Field(..., min_length=1) 
    genre: str = Field(..., min_length=1)
    # Matches the exact payload key from your log
    publish_year: int = Field(...)              
    
    cover_url: Optional[str] = None
    description: Optional[str] = None
    author_bio: Optional[str] = None
    # This safely catches the [""] array your frontend sends
    subjects: Optional[Union[str, List[str]]] = None 

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