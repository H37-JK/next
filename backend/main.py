from typing import Annotated
from fastapi import FastAPI, Form, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import create_engine, Session, SQLModel
from contextlib import asynccontextmanager

from .model.engine import get_engine, create_db_and_tables
from .routers import items
from .routers import files
from .schemas.form import FormData
from .model.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan = lifespan)
app.include_router(files.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/login/")
async def login(data: Annotated[FormData, Form()]):
    return data
