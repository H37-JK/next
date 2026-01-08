from typing import Annotated

import httpx
from fastapi import FastAPI, Form
from fastapi.security import OAuth2PasswordBearer
from contextlib import asynccontextmanager

from backend.model.engine import create_db_and_tables
from backend.routers import files
from backend.routers import user
from backend.schemas.form import FormData

from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
client = httpx.AsyncClient()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan = lifespan)
app.include_router(user.router)
app.include_router(files.router)







# @app.exception_handlers(StarletteHTTPException)
# async def custom_http_exception_handler(request, exc):
#     print(f"Http Error: {repr(exc)}")
#     return await http_exception_handler(request, exc)
