from fastapi import APIRouter, Depends, HTTPException
from ..dependencies import get_token_header

router = APIRouter (
    prefix = "/items",
    tags = ["items"],
    dependencies = [Depends(get_token_header)],
    responses = {404: {"description": "Not Found"}},
)

fake_items_db = {"plumbus": {"name": "Plumbus"}, "gun": {"name": "Portal Gun"}}


@router.get("/")
async def read_items():
    return fake_items_db


@router.get("/{item_id}")
async def read_item(item_id: str):
    if item_id not in fake_items_db:
        raise HTTPException(status_code = 404, detail = "아이템이 존재하지 않습니다.")
    return {"name": fake_items_db[item_id]["name"], "item_id": item_id}


@router.put (
    "/{item_id}",
    tags = ["custom"],
    responses = {403: {"description" : "접근 금지"}},
)
async def update_item(item_id: str):
    if item_id != 'test':
        raise HTTPException(status_code = 403, detail = "test 아이템만 업데이트 가능합니다")
    return {"item_id": item_id, "name": "test"}