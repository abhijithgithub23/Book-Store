from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.models.cart import CartItem
from app.models.book import Book
from app.models.user import User
from app.schemas.cart import CartItemResponse

router = APIRouter()

@router.get("/cart", response_model=List[CartItemResponse])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(CartItem).filter(CartItem.user_id == current_user.id).all()

@router.post("/cart/{book_id}")
def add_to_cart(book_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db.query(Book).filter(Book.id == book_id).first():
        raise HTTPException(status_code=404, detail="Book not found")
    if db.query(CartItem).filter(CartItem.user_id == current_user.id, CartItem.book_id == book_id).first():
        raise HTTPException(status_code=400, detail="Book already in cart")
    
    new_cart_item = CartItem(user_id=current_user.id, book_id=book_id)
    db.add(new_cart_item)
    db.commit()
    return {"message": "Added to cart successfully"}

@router.delete("/cart/{book_id}")
def remove_from_cart(book_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.user_id == current_user.id, CartItem.book_id == book_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    db.delete(cart_item)
    db.commit()
    return {"message": "Removed from cart successfully"}