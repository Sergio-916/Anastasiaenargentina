"""ensure_seeded_site_tables

Revision ID: 121f4837c176
Revises: 733a194e916f
Create Date: 2026-04-12 14:50:40.468472

Site tables documented in db_structure.md (admin_users, tours, tour_date, users)
were historically created via seed_db / SQL dump, not earlier Alembic revisions.
This migration makes a fresh `alembic upgrade head` database match production
layout. Safe on production: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.

"""
from alembic import op


revision = "121f4837c176"
down_revision = "733a194e916f"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tours (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            duration INTEGER NOT NULL,
            cost VARCHAR(50) NOT NULL,
            additional_cost VARCHAR(50) NOT NULL,
            meeting_point VARCHAR(255) NOT NULL,
            description VARCHAR(1000) NOT NULL,
            additional_description VARCHAR(1000) NOT NULL,
            max_capacity INTEGER,
            slug VARCHAR(255) NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS tour_date (
            id SERIAL PRIMARY KEY,
            tour_id INTEGER NOT NULL,
            date DATE NOT NULL,
            time VARCHAR(50) NOT NULL
        );

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

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'tour_date_tour_id_fkey'
            ) THEN
                ALTER TABLE tour_date
                ADD CONSTRAINT tour_date_tour_id_fkey
                FOREIGN KEY (tour_id) REFERENCES tours(id);
            END IF;
        END $$;
        """
    )

    # Align `contacts` with Contact model / db_structure (Alembic only had id + message + phone)
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'contacts'
            ) THEN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'contacts'
                      AND column_name = 'name'
                ) THEN
                    ALTER TABLE contacts
                    ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';
                    ALTER TABLE contacts ALTER COLUMN name DROP DEFAULT;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'contacts'
                      AND column_name = 'email'
                ) THEN
                    ALTER TABLE contacts
                    ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';
                    ALTER TABLE contacts ALTER COLUMN email DROP DEFAULT;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'contacts'
                      AND column_name = 'created_at'
                ) THEN
                    ALTER TABLE contacts
                    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                END IF;

                UPDATE contacts SET message = '' WHERE message IS NULL;
                ALTER TABLE contacts ALTER COLUMN message SET NOT NULL;
            END IF;
        END $$;
        """
    )


def downgrade():
    # Seeded/site tables and contact column fixes are not reverted to avoid data loss.
    pass
