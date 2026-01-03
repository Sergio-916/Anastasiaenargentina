
import uuid
from typing import Optional
from datetime import datetime, date
from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

# =====================================================
#             SEEDED MODELS (from Database)
# =====================================================

# -----------------------------------------------------
# Admin Users
# -----------------------------------------------------
class AdminUser(SQLModel, table=True):
    __tablename__ = "admin_users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

# -----------------------------------------------------
# Contacts
# -----------------------------------------------------
class Contact(SQLModel, table=True):
    __tablename__ = "contacts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    phone: str = Field(max_length=50)
    email: str = Field(max_length=255)
    message: str 
    created_at: Optional[datetime] = Field(default_factory=datetime.now)


# Pydantic model for creating contacts
class ContactCreate(SQLModel):
    name: str = Field(max_length=255)
    phone: str = Field(max_length=50)
    email: str = Field(max_length=255)
    message: str

# -----------------------------------------------------
# Tours
# -----------------------------------------------------
class Tour(SQLModel, table=True):
    __tablename__ = "tours"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    duration: int
    cost: str = Field(max_length=50)
    additional_cost: str = Field(max_length=50)
    meeting_point: str = Field(max_length=255)
    description: str = Field(max_length=1000)
    additional_description: str = Field(max_length=1000)
    max_capacity: Optional[int] = None
    slug: str = Field(unique=True, max_length=255)
    
    # Relationships
    dates: list["TourDate"] = Relationship(back_populates="tour")

    def __str__(self):
        return self.name

# -----------------------------------------------------
# Tour Dates
# -----------------------------------------------------
class TourDate(SQLModel, table=True):
    __tablename__ = "tour_date"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    tour_id: int = Field(foreign_key="tours.id")
    date: date
    time: str = Field(max_length=50)
    
    # Relationships
    tour: Optional[Tour] = Relationship(back_populates="dates")

# -----------------------------------------------------
# Site Users (Renamed from User to avoid conflict)
# Mapped to 'users' table
# -----------------------------------------------------
class SiteUser(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = Field(default=None, max_length=255)
    email: str = Field(unique=True, max_length=255)
    password: str = Field(max_length=255)
    emailVerified: Optional[datetime] = None
    image: Optional[str] = None


# =====================================================
#             ORIGINAL APP MODELS
# =====================================================

# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name (default 'user')
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Shared Utils
class Message(SQLModel):
    message: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
