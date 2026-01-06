from typing import Union, Annotated

from fastapi import FastAPI, HTTPException, Form, File, UploadFile
from fastapi.params import Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from dataclasses import dataclass

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@dataclass
class User(BaseModel):
    username: str
    email: Union[str, None] = None


def fake_decode_token(token):
    return User(
        username=token, email = "these990703@gmail.com"
    )


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = fake_decode_token(token)
    return user

class Item(BaseModel):
    name: str
    price: float
    is_offer: Union[bool, None] = None

class FormData(BaseModel):
    email: str
    password: str
    model_config = {"extra": "forbid"}


items = {
    "sword": "sword1"
}


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: str, q: Union[str, None] = None):
    if item_id not in items:
        raise HTTPException(status_code = 404, detail = "아이템이 존재하지 않습니다")
    return {"item": items[item_id]}


@app.post("/login/")
async def login(data: Annotated[FormData, Form()]):
    return data


@app.post("/files")
async def create_file(file: Annotated[bytes | None, File()] = None):
    if not file:
        return {"message": "파일이 전송 되지 않았습니다."}
    else:
        return {"file_size": len(file)}


@app.post("/upload/file/")
async def create_upload_file(file: UploadFile | None = None):
    if not file:
        return {"message": "파일이 전송 되지 않았습니다."}
    else:
        return {"filename": file.filename}


@app.get("/users/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user