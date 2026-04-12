"""create blog_posts table

Revision ID: 8b78faf47d11
Revises: 8bb9b562961f
Create Date: 2026-01-04 13:20:57.664670

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


revision = '8b78faf47d11'
down_revision = '8bb9b562961f'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # Create blog_posts table if it doesn't exist
    op.execute("""
        CREATE TABLE IF NOT EXISTS blog_posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content VARCHAR(10000) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            keywords TEXT,
            image TEXT,
            reading_time_minutes INTEGER,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )
    """)

    # Drop test_table if it exists
    op.execute("DROP TABLE IF EXISTS test_table")

    # Alter contacts.message only if table/column exist
    if "contacts" in tables:
        contact_columns = [c["name"] for c in inspector.get_columns("contacts")]
        if "message" in contact_columns:
            op.alter_column(
                "contacts",
                "message",
                existing_type=sa.TEXT(),
                type_=sqlmodel.sql.sqltypes.AutoString(),
                existing_nullable=False,
            )

    # Add FK only if both tables exist and FK doesn't exist
    if "tour_date" in tables and "tours" in tables:
        op.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'tour_date_tour_id_fkey'
                ) THEN
                    ALTER TABLE tour_date
                    ADD CONSTRAINT tour_date_tour_id_fkey
                    FOREIGN KEY (tour_id) REFERENCES tours(id);
                END IF;
            END $$;
        """)

    # Alter users.image only if table/column exist
    if "users" in tables:
        user_columns = [c["name"] for c in inspector.get_columns("users")]
        if "image" in user_columns:
            op.alter_column(
                "users",
                "image",
                existing_type=sa.TEXT(),
                type_=sqlmodel.sql.sqltypes.AutoString(),
                existing_nullable=True,
            )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if "users" in tables:
        user_columns = [c["name"] for c in inspector.get_columns("users")]
        if "image" in user_columns:
            op.alter_column(
                "users",
                "image",
                existing_type=sqlmodel.sql.sqltypes.AutoString(),
                type_=sa.TEXT(),
                existing_nullable=True,
            )

    if "tour_date" in tables:
        fk_names = {fk["name"] for fk in inspector.get_foreign_keys("tour_date")}
        if "tour_date_tour_id_fkey" in fk_names:
            op.drop_constraint("tour_date_tour_id_fkey", "tour_date", type_="foreignkey")

    if "contacts" in tables:
        contact_columns = [c["name"] for c in inspector.get_columns("contacts")]
        if "message" in contact_columns:
            op.alter_column(
                "contacts",
                "message",
                existing_type=sqlmodel.sql.sqltypes.AutoString(),
                type_=sa.TEXT(),
                existing_nullable=False,
            )

    op.execute("""
        CREATE TABLE IF NOT EXISTS test_table (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL
        )
    """)

    op.execute("DROP TABLE IF EXISTS blog_posts")