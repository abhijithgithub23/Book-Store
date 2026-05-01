from pydantic import BaseModel
from app.schemas.book import BookSchema

class CartItemResponse(BaseModel):
    id: int
    book: BookSchema
    class Config:
        from_attributes = True