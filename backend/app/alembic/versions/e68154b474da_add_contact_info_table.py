"""add_contact_info_table

Revision ID: e68154b474da
Revises: 1a31ce608336
Create Date: 2025-12-27 16:39:13.005099

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e68154b474da'
down_revision = '1a31ce608336'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'contacts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('message', sa.Text(), nullable=True),
    )


def downgrade():
    op.drop_table("contacts")
