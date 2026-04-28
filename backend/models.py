from sqlalchemy import Column, String, Integer, ForeignKey, Text, ARRAY
from sqlalchemy.orm import relationship
from database import Base

class Book(Base):
    __tablename__ = "books"
    
    # This matches the table you already created with your Node.js script!
    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    genre = Column(String(50), nullable=False)
    publish_year = Column(String(20), nullable=False)
    cover_url = Column(Text)
    description = Column(Text, nullable=False)
    author_name = Column(String(255), nullable=False)
    author_bio = Column(Text, nullable=False)
    subjects = Column(ARRAY(String))

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    
    cart_items = relationship("CartItem", back_populates="owner")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(String(100), ForeignKey("books.id"))

    owner = relationship("User", back_populates="cart_items")
    book = relationship("Book")