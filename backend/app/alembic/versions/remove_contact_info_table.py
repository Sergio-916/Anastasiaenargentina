"""remove_contact_info_table

Revision ID: 8bb9b562961f
Revises: 827700c305bd
Create Date: 2025-01-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8bb9b562961f'
down_revision = '827700c305bd'
branch_labels = None
depends_on = None


def upgrade():
    # Drop contact_info table if it exists
    op.drop_table("contact_info")


def downgrade():
    # Recreate contact_info table (if needed for rollback)
    op.create_table(
        "contact_info",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("whatsapp_url", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

