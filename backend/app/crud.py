import uuid
from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate, AdminUser


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    """
    Authenticate user by email or admin username.
    First checks AdminUser table by username, then User table by email.
    Returns User object if authentication succeeds, None otherwise.
    For AdminUser, finds or creates a corresponding User entry for token generation.
    """
    # Try AdminUser first (by username)
    admin_user = session.exec(
        select(AdminUser).where(AdminUser.username == email)
    ).first()
    
    if admin_user:
        if verify_password(password, admin_user.password_hash):
            # For AdminUser, we need to find or create a corresponding User
            # Since username might not be a valid email, we create email from username
            # Format: username@admin.local
            admin_email = f"{admin_user.username}@admin.local"
            
            # Check if there's a User with this admin email
            user = get_user_by_email(session=session, email=admin_email)
            
            if user:
                # User exists - update password hash to match AdminUser and ensure superuser status
                # This ensures the User can authenticate with the same password
                user.hashed_password = admin_user.password_hash
                user.is_superuser = True
                user.is_active = True
                session.add(user)
                session.commit()
                session.refresh(user)
                return user
            else:
                # No User found, create one for AdminUser
                # Use the same password hash from AdminUser to avoid re-hashing
                from app.models import User
                new_user = User(
                    email=admin_email,
                    hashed_password=admin_user.password_hash,  # Use same hash
                    is_superuser=True,
                    is_active=True,
                    full_name=f"Admin User ({admin_user.username})"
                )
                session.add(new_user)
                session.commit()
                session.refresh(new_user)
                return new_user
        else:
            # Password doesn't match AdminUser
            return None
    
    # Try User table (by email)
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item
