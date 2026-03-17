from typing import Any

from fastapi import APIRouter

from app.api.deps import SessionDep
from app.crud import create_user as crud_create_user
from app.models import UserCreate, UserPublic

router = APIRouter(tags=["private"], prefix="/private")


@router.post("/users/", response_model=UserPublic)
def create_user(user_in: UserCreate, session: SessionDep) -> Any:
    """
    Create a new user (local/dev only).
    """
    return crud_create_user(session=session, user_create=user_in)
