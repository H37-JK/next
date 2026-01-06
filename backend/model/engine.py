from typing import Annotated
from fastapi import Depends
from sqlmodel import create_engine, SQLModel, Session

def get_engine():
    sql_url = "postgresql://hjk:star8903@localhost:5432/postgres"
    return create_engine(sql_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(get_engine())

def get_session():
    with Session(get_engine()) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]