import enum
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

class GenreEnum(str, enum.Enum):
    fiction = "fiction"
    fantasy = "fantasy"
    romance = "romance"
    science_fiction = "science_fiction"
    thriller = "thriller"
    mystery = "mystery"

class BookSchema(BaseModel):
    id: str
    title: str
    genre: GenreEnum  
    publish_year: int 
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
    genre: GenreEnum  
    publish_year: int = Field(..., ge=1000, le=9999, description="Must be a 4-digit year")              
    cover_url: Optional[str] = None
    description: Optional[str] = None
    author_bio: Optional[str] = None
    subjects: Optional[List[str]] = [] 

    @field_validator('publish_year')
    @classmethod
    def validate_publish_year(cls, v):
        if v < 1000 or v > 2100:
            raise ValueError("Publish year must be a valid year between 1000 and 2100")
        return v


class BookListItem(BaseModel):
    id: str  
    title: str
    author_name: str
    cover_url: str
    publish_year: int 

    class Config:
        from_attributes = True 

class PaginatedBooksResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[BookListItem]