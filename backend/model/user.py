from sqlmodel import Field, SQLModel
from pydantic import EmailStr

class User(SQLModel, table = True):
    id: int | None = Field(default = None, primary_key = True)
    email: EmailStr = Field(index = True, nullable = False)
    password: str = Field(nullable = False)
    name: str | None = Field(nullable = True)
