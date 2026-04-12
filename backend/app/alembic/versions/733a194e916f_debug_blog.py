"""debug blog

Revision ID: 733a194e916f
Revises: 137068116eee
Create Date: 2026-04-11 13:30:00.145150

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '733a194e916f'
down_revision = '137068116eee'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("blog_posts", "content", new_column_name="content_markdown")
    op.alter_column("blog_posts", "image", new_column_name="cover_image_url")


def downgrade():
    op.alter_column("blog_posts", "content_markdown", new_column_name="content")
    op.alter_column("blog_posts", "cover_image_url", new_column_name="image")
