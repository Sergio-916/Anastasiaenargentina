"""Add oauth_accounts table, user image, nullable hashed_password

Revision ID: f0a1b2c3d4e5
Revises: 490e8110e153
Create Date: 2025-02-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "f0a1b2c3d4e5"
down_revision = "490e8110e153"
branch_labels = None
depends_on = None


def upgrade():
    # Add image column to user table
    op.add_column(
        "user",
        sa.Column("image", sa.String(length=500), nullable=True),
    )

    # Make hashed_password nullable for OAuth users
    op.alter_column(
        "user",
        "hashed_password",
        existing_type=sa.String(),
        nullable=True,
    )

    # Create oauth_accounts table
    op.create_table(
        "oauth_accounts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_user_id", sa.String(length=255), nullable=False),
        sa.Column("access_token", sa.String(), nullable=True),
        sa.Column("refresh_token", sa.String(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_oauth_accounts_provider_provider_user_id",
        "oauth_accounts",
        ["provider", "provider_user_id"],
        unique=True,
    )


def downgrade():
    op.drop_index(
        "ix_oauth_accounts_provider_provider_user_id",
        table_name="oauth_accounts",
    )
    op.drop_table("oauth_accounts")

    op.alter_column(
        "user",
        "hashed_password",
        existing_type=sa.String(),
        nullable=False,
    )

    op.drop_column("user", "image")
