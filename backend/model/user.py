from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Field, Session, SQLModel, create_engine, select

from backend.model.engine import SessionDep


class User(SQLModel, table = True):
    id: int | None = Field(default = None, primary_key = True)
    email: str = Field(index = True)


