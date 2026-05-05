from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine
from app.db.base import Base

from app.api.routes import auth, books, cart, users
import app.models  

# Create tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BookStore API")

#  CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect all the routes
app.include_router(auth.router, tags=["Auth"])
app.include_router(users.router, tags=["Users"])
app.include_router(books.router, tags=["Books"])
app.include_router(cart.router, tags=["Cart"])

