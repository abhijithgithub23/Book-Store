import uuid
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
    # 1. Start the base query WITHOUT with_entities
    query = db.query(Book)
    
    # 2. Apply your filters
    if genre and genre.lower() != 'popular':
        query = query.filter(Book.genre.ilike(f"%{genre}%"))
    if q:
        query = query.filter(or_(Book.title.ilike(f"%{q}%"), Book.author_name.ilike(f"%{q}%")))
        
    query = query.order_by(desc(Book.publish_year))
    
    # 3. Get the count BEFORE limiting or specifying entities
    total_books = query.count()
    
    # 4. NOW apply with_entities, offset, and limit
    offset = (page - 1) * size
    books_rows = query.with_entities(
        Book.id,
        Book.title,
        Book.author_name,
        Book.cover_url,
        Book.publish_year
    ).offset(offset).limit(size).all()
    
    # 5. Safely convert the SQLAlchemy Rows into dictionaries for FastAPI/Pydantic
    books_data = [dict(row._mapping) for row in books_rows] 
    
    return {"total": total_books, "page": page, "size": size, "items": books_data}

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
    
    db_book_data = {
        "id": book_data.get("id") or str(uuid.uuid4()),
        "title": book_data["title"],
        "author_name": book_data["author_name"], 
        "genre": book_data["genre"],
        "publish_year": str(book_data["publish_year"]),
        "cover_url": book_data.get("cover_url"),
        "description": book_data.get("description"),
        "author_bio": book_data.get("author_bio"),
        "subjects": book_data.get("subjects") or []
    }
        
    if db.query(Book).filter(Book.id == db_book_data["id"]).first():
        raise HTTPException(status_code=400, detail="Book ID already exists")
        
    new_book = Book(**db_book_data)
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@router.put("/books/{book_id}", response_model=BookSchema)
def update_book(book_id: str, book_update: BookCreate, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    book_data = book_update.model_dump()

    db_book.title = book_data["title"]
    db_book.author_name = book_data["author_name"]
    db_book.genre = book_data["genre"]
    db_book.publish_year = str(book_data["publish_year"])
    db_book.cover_url = book_data.get("cover_url")
    db_book.description = book_data.get("description")
    db_book.author_bio = book_data.get("author_bio")
    db_book.subjects = book_data.get("subjects") or [] 
        
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