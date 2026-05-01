import uuid  # <--- Import UUID library
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.api.deps import get_db, get_admin_user
from app.models.book import Book
from app.models.cart import CartItem
from app.models.user import User
from app.schemas.book import BookSchema, BookCreate, PaginatedBooksResponse

router = APIRouter()

@router.get("/books", response_model=PaginatedBooksResponse)
def get_books(genre: str = None, q: str = None, page: int = 1, size: int = 20, db: Session = Depends(get_db)):
    query = db.query(Book)
    if genre and genre.lower() != 'popular':
        query = query.filter(Book.genre.ilike(f"%{genre}%"))
    if q:
        query = query.filter(or_(Book.title.ilike(f"%{q}%"), Book.author_name.ilike(f"%{q}%")))
        
    query = query.order_by(desc(Book.publish_year))
    total_books = query.count()
    offset = (page - 1) * size
    books = query.offset(offset).limit(size).all()
    
    return {"total": total_books, "page": page, "size": size, "items": books}

@router.get("/books/{book_id}", response_model=BookSchema)
def get_book_details(book_id: str, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

# Admin Routes
@router.post("/books", response_model=BookSchema)
def create_book(book: BookCreate, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    book_data = book.model_dump()
    
    # --- UUID GENERATION ---
    # If frontend doesn't send an ID (which it won't for new books), generate one!
    if not book_data.get("id"):
        book_data["id"] = str(uuid.uuid4())
        
    if db.query(Book).filter(Book.id == book_data["id"]).first():
        raise HTTPException(status_code=400, detail="Book ID already exists")
        
    new_book = Book(**book_data)
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@router.put("/books/{book_id}", response_model=BookSchema)
def update_book(book_id: str, book_update: BookCreate, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    update_data = book_update.model_dump(exclude_unset=True)
    # Ensure we don't accidentally overwrite the ID during an update
    update_data.pop("id", None) 
    
    for key, value in update_data.items():
        setattr(db_book, key, value)
        
    db.commit()
    db.refresh(db_book)
    return db_book

@router.delete("/books/{book_id}")
def delete_book(book_id: str, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.query(CartItem).filter(CartItem.book_id == book_id).delete()
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted"}