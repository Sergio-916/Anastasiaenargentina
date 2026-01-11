"""change_blog_posts_content_to_text

Revision ID: 490e8110e153
Revises: 8b78faf47d11
Create Date: 2026-01-10 21:34:12.265935

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '490e8110e153'
down_revision = '8b78faf47d11'
branch_labels = None
depends_on = None


def upgrade():
    # Change content column from VARCHAR(10000) to TEXT to support HTML with Base64 images
    op.execute("""
        ALTER TABLE blog_posts 
        ALTER COLUMN content TYPE TEXT
    """)


def downgrade():
    # Revert content column back to VARCHAR(10000)
    op.execute("""
        ALTER TABLE blog_posts 
        ALTER COLUMN content TYPE VARCHAR(10000)
    """)
