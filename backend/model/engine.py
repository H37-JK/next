import os
from dotenv import load_dotenv
from typing import Annotated
from fastapi import Depends
from sqlmodel import create_engine, SQLModel, Session

load_dotenv()


def get_engine():
    sql_url = os.getenv("DATABASE_URL")
    return create_engine(sql_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(get_engine())

def get_session():
    with Session(get_engine()) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]