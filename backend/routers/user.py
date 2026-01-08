from fastapi import APIRouter
from sqlmodel import select
from backend.model.user import User
from backend.model.engine import SessionDep
from backend.passlib.argon2 import encode_password, verify_password
from backend.schemas.token import Token

router = APIRouter (
    prefix = "/users",
    tags = ["users"],
    responses = {404: {"description" : "Not Found"}}
)


@router.get("/")
def read_users(session: SessionDep):
    return session.exec(select(User)).all()

@router.get("/{user_id}")
def read_user(session: SessionDep, user_id: int):
    return session.exec(select(User).where(User.id == user_id)).one_or_none()

@router.get("/authenticate")
def authenticate(session: SessionDep, email: str, password: str):
    user = session.exec(select(User).where(User.email == email)).one_or_none()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

@router.post("/users", response_model = User, response_model_exclude = {"password"})
def create_users(user: User, session: SessionDep) -> User:
    user.password = encode_password(user.password)
    print(user.password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user