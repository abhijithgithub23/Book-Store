from sqlalchemy import Column, String, Text, ARRAY
from app.db.base import Base

class Book(Base):
    __tablename__ = "books"
    
    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    genre = Column(String(50), nullable=False)
    publish_year = Column(String(20), nullable=False)
    cover_url = Column(Text)
    description = Column(Text, nullable=False)
    author_name = Column(String(255), nullable=False)
    author_bio = Column(Text, nullable=False)
    subjects = Column(ARRAY(String))