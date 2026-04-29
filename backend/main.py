from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import or_, desc # Add this to your SQLAlchemy imports at the top!


import models
import schemas
import auth
from database import engine, get_db

# Create the missing tables (users, cart_items) safely
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BookStore API")

# Enable CORS so your Angular app (localhost:4200) can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH & USER ROUTES ---

@app.post("/signup", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/profile", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user



# --- BOOK ROUTES ---

@app.get("/books", response_model=schemas.PaginatedBooksResponse)
def get_books(genre: str = None, q: str = None, page: int = 1, size: int = 20, db: Session = Depends(get_db)):
    query = db.query(models.Book)
    
    # 1. Filter by Genre
    if genre and genre.lower() != 'popular':
        query = query.filter(models.Book.genre.ilike(f"%{genre}%"))
        
    # 2. Filter by Search Query (Title OR Author)
    if q:
        query = query.filter(
            or_(
                models.Book.title.ilike(f"%{q}%"),
                models.Book.author_name.ilike(f"%{q}%")
            )
        )
        
    # 3. Sort by Publish Year Descending (Latest on top)
    query = query.order_by(desc(models.Book.publish_year))
    
    # 4. Pagination Math
    total_books = query.count()
    offset = (page - 1) * size
    books = query.offset(offset).limit(size).all()
    
    # Return the new Paginated Schema
    return {
        "total": total_books,
        "page": page,
        "size": size,
        "items": books
    }

@app.get("/books/{book_id}", response_model=schemas.BookSchema)
def get_book_details(book_id: str, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

# --- CART ROUTES (PROTECTED) ---

@app.get("/cart", response_model=List[schemas.CartItemResponse])
def get_cart(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()

@app.post("/cart/{book_id}")
def add_to_cart(book_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Check if book exists
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if already in cart
    existing = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id, 
        models.CartItem.book_id == book_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Book already in cart")
    
    new_cart_item = models.CartItem(user_id=current_user.id, book_id=book_id)
    db.add(new_cart_item)
    db.commit()
    return {"message": "Added to cart successfully"}

@app.delete("/cart/{book_id}")
def remove_from_cart(book_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id, 
        models.CartItem.book_id == book_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Removed from cart successfully"}