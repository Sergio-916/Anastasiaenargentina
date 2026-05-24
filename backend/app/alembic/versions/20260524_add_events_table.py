"""add_events_table

Revision ID: 20260524adde
Revises: 121f4837c176
Create Date: 2026-05-24 00:00:00.000000

"""

from alembic import op


revision = "20260524adde"
down_revision = "121f4837c176"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            slug VARCHAR(255) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            summary_short TEXT NOT NULL,
            summary_long TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE,
            start_time_local VARCHAR(20),
            end_time_local VARCHAR(20),
            timezone VARCHAR(100) NOT NULL,
            venue_name VARCHAR(255),
            venue_address VARCHAR(255),
            neighborhood VARCHAR(100),
            city VARCHAR(100) NOT NULL,
            country VARCHAR(100) NOT NULL,
            language VARCHAR(10) NOT NULL,
            price_type VARCHAR(50) NOT NULL,
            price_currency VARCHAR(10),
            price_value NUMERIC,
            ticket_url TEXT,
            official_url TEXT,
            image_primary_url TEXT,
            image_alt VARCHAR(500),
            image_credit VARCHAR(255),
            tags JSONB,
            source_urls JSONB,
            status VARCHAR(50) NOT NULL,
            source_batch VARCHAR(100),
            source_generated_at TIMESTAMP,
            is_long_term BOOLEAN NOT NULL DEFAULT FALSE,
            is_visible BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS ix_events_start_date ON events (start_date);
        CREATE INDEX IF NOT EXISTS ix_events_is_visible ON events (is_visible);
        """
    )


def downgrade():
    op.execute("DROP TABLE IF EXISTS events")
