#!/usr/bin/env python3
"""
Script to create or update admin user in the database.
Usage: python scripts/create_admin.py [username] [password]
"""
import sys
from sqlmodel import Session, select

from app.core.db import engine
from app.core.security import get_password_hash
from app.models import AdminUser


def create_or_update_admin(username: str, password: str) -> None:
    """
    Create or update admin user with hashed password.
    """
    with Session(engine) as session:
        # Check if admin user exists
        admin_user = session.exec(
            select(AdminUser).where(AdminUser.username == username)
        ).first()
        
        # Hash password using passlib (same as verify_password uses)
        password_hash = get_password_hash(password)
        
        if admin_user:
            # Update existing user
            admin_user.password_hash = password_hash
            session.add(admin_user)
            session.commit()
            print(f"✓ Admin user '{username}' password updated successfully")
        else:
            # Create new user
            new_admin = AdminUser(
                username=username,
                password_hash=password_hash
            )
            session.add(new_admin)
            session.commit()
            print(f"✓ Admin user '{username}' created successfully")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/create_admin.py <username> <password>")
        print("Example: python scripts/create_admin.py admin mypassword")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    
    create_or_update_admin(username, password)

