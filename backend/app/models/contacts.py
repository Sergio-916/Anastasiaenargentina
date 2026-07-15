from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Contact(SQLModel, table=True):
    __tablename__ = "contacts"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    phone: str = Field(max_length=50)
    email: str = Field(max_length=255)
    message: str
    created_at: Optional[datetime] = Field(default_factory=datetime.now)


class ContactCreate(SQLModel):
    name: str = Field(max_length=255)
    phone: str = Field(max_length=50)
    email: str = Field(max_length=255)
    message: str
