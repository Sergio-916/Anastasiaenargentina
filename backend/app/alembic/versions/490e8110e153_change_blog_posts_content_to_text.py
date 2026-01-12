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
    # Handle both cases: table exists (alter) or doesn't exist (create with TEXT)
    op.execute("""
        DO $$
        BEGIN
            -- If table doesn't exist, create it with TEXT type directly
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'blog_posts'
            ) THEN
                CREATE TABLE blog_posts (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    slug VARCHAR(255) NOT NULL UNIQUE,
                    description TEXT,
                    keywords TEXT,
                    image TEXT,
                    reading_time_minutes INTEGER,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP
                );
            ELSE
                -- Table exists, alter the column type from VARCHAR(10000) to TEXT
                ALTER TABLE blog_posts 
                ALTER COLUMN content TYPE TEXT;
            END IF;
        END $$;
    """)


def downgrade():
    # Revert content column back to VARCHAR(10000)
    op.execute("""
        ALTER TABLE blog_posts 
        ALTER COLUMN content TYPE VARCHAR(10000)
    """)
