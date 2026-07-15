"""rename_user_table_to_users

Revision ID: 20260714renameusers
Revises: 20260714dropusers
Create Date: 2026-07-14

Rename active auth table from `user` to `users`.
"""
from alembic import op


revision = "20260714renameusers"
down_revision = "20260714dropusers"
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table("user", "users")
    op.execute("ALTER INDEX IF EXISTS ix_user_email RENAME TO ix_users_email")
    op.execute("ALTER INDEX IF EXISTS user_pkey RENAME TO users_pkey")


def downgrade():
    op.execute("ALTER INDEX IF EXISTS users_pkey RENAME TO user_pkey")
    op.execute("ALTER INDEX IF EXISTS ix_users_email RENAME TO ix_user_email")
    op.rename_table("users", "user")
