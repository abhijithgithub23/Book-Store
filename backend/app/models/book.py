from sqlalchemy import Column, String, Text, ARRAY
from app.db.base import Base

import enum
from sqlalchemy import Column, String, Text, Enum
from sqlalchemy.dialects.postgresql import ARRAY 

from sqlalchemy import Column, String, Text, Integer, Enum 
from sqlalchemy.dialects.postgresql import ARRAY 
import enum

class GenreEnum(str, enum.Enum):
    fiction = "fiction"
    fantasy = "fantasy"
    romance = "romance"
    science_fiction = "science_fiction"
    thriller = "thriller"
    mystery = "mystery"
    
class Book(Base):
    __tablename__ = "books"
    
    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    genre = Column(Enum(GenreEnum), nullable=False) 
    
    publish_year = Column(Integer, nullable=False) 
    
    cover_url = Column(Text)
    description = Column(Text, nullable=False)
    author_name = Column(String(255), nullable=False)
    author_bio = Column(Text, nullable=False)
    subjects = Column(ARRAY(String))