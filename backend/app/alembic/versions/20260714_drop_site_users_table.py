"""drop_site_users_table

Revision ID: 20260714dropusers
Revises: 20260524adde
Create Date: 2026-07-14

Remove obsolete seeded `users` table before renaming active auth `user` to `users`.
"""
from alembic import op


revision = "20260714dropusers"
down_revision = "20260524adde"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("DROP TABLE IF EXISTS users")


def downgrade():
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            "emailVerified" TIMESTAMP,
            image TEXT
        );
        """
    )
