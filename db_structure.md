# Database Structure

Single source of truth for the database schema. Use this file to validate queries, ORM models, and migrations.

Alembic revision `121f4837c176` (`ensure_seeded_site_tables`) creates the seeded-site tables below when they are missing, so a clean `alembic upgrade head` matches this document (in addition to `user`, `oauth_accounts`, and `blog_posts` from earlier revisions).

---

## Seeded Tables (from existing database)

### admin_users

| Column       | Type         | Constraints              | Description        |
|-------------|--------------|--------------------------|--------------------|
| id          | INTEGER      | PRIMARY KEY, AUTO        |                    |
| username    | VARCHAR(255) | UNIQUE, NOT NULL         |                    |
| password_hash | VARCHAR(255) | NOT NULL                 |                    |
| created_at  | DATETIME     | DEFAULT now()            |                    |
| updated_at  | DATETIME     | DEFAULT now()            |                    |

**Model:** `AdminUser`

---

### contacts

| Column     | Type         | Constraints       | Description        |
|------------|--------------|-------------------|--------------------|
| id         | INTEGER      | PRIMARY KEY, AUTO |                    |
| name       | VARCHAR(255) | NOT NULL          |                    |
| phone      | VARCHAR(50)  | NOT NULL          |                    |
| email      | VARCHAR(255) | NOT NULL          |                    |
| message    | TEXT         | NOT NULL          |                    |
| created_at | DATETIME     | DEFAULT now()     |                    |

**Model:** `Contact`

---

### tours

| Column               | Type         | Constraints       | Description        |
|----------------------|--------------|-------------------|--------------------|
| id                   | INTEGER      | PRIMARY KEY, AUTO |                    |
| name                 | VARCHAR(255) | NOT NULL          |                    |
| duration             | INTEGER      | NOT NULL          |                    |
| cost                 | VARCHAR(50)  | NOT NULL          |                    |
| additional_cost      | VARCHAR(50)  | NOT NULL          |                    |
| meeting_point        | VARCHAR(255) | NOT NULL          |                    |
| description          | VARCHAR(1000)| NOT NULL          |                    |
| additional_description | VARCHAR(1000)| NOT NULL       |                    |
| max_capacity         | INTEGER      | NULL              |                    |
| slug                 | VARCHAR(255) | UNIQUE, NOT NULL  |                    |

**Model:** `Tour`  
**Relationships:** One-to-many with `tour_date`

---

### tour_date

| Column  | Type         | Constraints       | Description        |
|---------|--------------|-------------------|--------------------|
| id      | INTEGER      | PRIMARY KEY, AUTO |                    |
| tour_id | INTEGER      | FK → tours.id     |                    |
| date    | DATE         | NOT NULL          |                    |
| time    | VARCHAR(50)  | NOT NULL          |                    |

**Model:** `TourDate`  
**Relationships:** Many-to-one with `tours`

---

### blog_posts

| Column               | Type         | Constraints       | Description        |
|----------------------|--------------|-------------------|--------------------|
| id                   | INTEGER      | PRIMARY KEY, AUTO |                    |
| title                | VARCHAR(255) | NOT NULL          |                    |
| content_markdown     | TEXT         | NOT NULL          | Markdown body; images as `/blog-media/{slug}/...` |
| slug                 | VARCHAR(255) | UNIQUE, NOT NULL  |                    |
| description          | VARCHAR      | NULL              |                    |
| keywords             | VARCHAR      | NULL              |                    |
| cover_image_url      | VARCHAR      | NULL              | Optional; first embedded image path (same prefix as above) |
| reading_time_minutes | INTEGER      | NULL              |                    |
| created_at           | DATETIME     | DEFAULT now()     |                    |
| updated_at           | DATETIME     | DEFAULT now()     |                    |

**Model:** `BlogPost`

---

### events

| Column              | Type         | Constraints              | Description        |
|---------------------|--------------|--------------------------|--------------------|
| id                  | INTEGER      | PRIMARY KEY, AUTO        |                    |
| slug                | VARCHAR(255) | UNIQUE, NOT NULL         | Stable event URL identifier |
| title               | VARCHAR(255) | NOT NULL                 |                    |
| category            | VARCHAR(100) | NOT NULL                 |                    |
| summary_short       | TEXT         | NOT NULL                 | Card/list summary  |
| summary_long        | TEXT         | NOT NULL                 | Detail summary     |
| start_date          | DATE         | NOT NULL                 |                    |
| end_date            | DATE         | NULL                     |                    |
| start_time_local    | VARCHAR(20)  | NULL                     | Local event start time |
| end_time_local      | VARCHAR(20)  | NULL                     | Local event end time |
| timezone            | VARCHAR(100) | NOT NULL                 |                    |
| venue_name          | VARCHAR(255) | NULL                     |                    |
| venue_address       | VARCHAR(255) | NULL                     |                    |
| neighborhood        | VARCHAR(100) | NULL                     |                    |
| city                | VARCHAR(100) | NOT NULL                 |                    |
| country             | VARCHAR(100) | NOT NULL                 |                    |
| language            | VARCHAR(10)  | NOT NULL                 | Source/content language |
| price_type          | VARCHAR(50)  | NOT NULL                 | e.g. free, paid, unknown |
| price_currency      | VARCHAR(10)  | NULL                     |                    |
| price_value         | NUMERIC      | NULL                     |                    |
| ticket_url          | TEXT         | NULL                     |                    |
| official_url        | TEXT         | NULL                     |                    |
| image_primary_url   | TEXT         | NULL                     |                    |
| image_alt           | VARCHAR(500) | NULL                     |                    |
| image_credit        | VARCHAR(255) | NULL                     |                    |
| tags                | JSON         | NULL                     | List of tags       |
| source_urls         | JSON         | NULL                     | List of source URLs |
| status              | VARCHAR(50)  | NOT NULL                 | e.g. scheduled     |
| source_batch        | VARCHAR(100) | NULL                     | Import/source batch id |
| source_generated_at | DATETIME     | NULL                     | Source JSON generated_at |
| is_long_term        | BOOLEAN      | DEFAULT false, NOT NULL  | Marks long-term event records |
| is_visible          | BOOLEAN      | DEFAULT false, NOT NULL  | Editorial marker for public display |
| created_at          | DATETIME     | DEFAULT now()            |                    |
| updated_at          | DATETIME     | DEFAULT now()            |                    |

**Model:** `Event`

Public API returns only `is_visible = true` records and only when `FEATURE_SHOW_EVENTS=true`.

---

### users (SiteUser)

| Column        | Type         | Constraints       | Description        |
|---------------|--------------|-------------------|--------------------|
| id            | INTEGER      | PRIMARY KEY, AUTO |                    |
| name          | VARCHAR(255) | NULL              |                    |
| email         | VARCHAR(255) | UNIQUE, NOT NULL  |                    |
| password      | VARCHAR(255) | NOT NULL          |                    |
| emailVerified | DATETIME     | NULL              |                    |
| image         | VARCHAR      | NULL              |                    |

**Model:** `SiteUser` (mapped to `users` table)

---

## Original App Tables

### user

| Column          | Type         | Constraints       | Description        |
|-----------------|--------------|-------------------|--------------------|
| id              | UUID         | PRIMARY KEY       |                    |
| email           | VARCHAR(255) | UNIQUE, NOT NULL  |                    |
| hashed_password | VARCHAR(255) | NULL              | OAuth-only users   |
| full_name       | VARCHAR(255) | NULL              |                    |
| is_active       | BOOLEAN      | DEFAULT true      |                    |
| is_superuser    | BOOLEAN      | DEFAULT false     |                    |
| image           | VARCHAR(500) | NULL              |                    |

**Model:** `User`  
**Relationships:** One-to-many with `oauth_accounts`

---

### oauth_accounts

| Column          | Type         | Constraints       | Description        |
|-----------------|--------------|-------------------|--------------------|
| id              | UUID         | PRIMARY KEY       |                    |
| user_id         | UUID         | FK → user.id      | NOT NULL           |
| provider        | VARCHAR(50)  | NOT NULL          | e.g. "google"      |
| provider_user_id| VARCHAR(255) | NOT NULL          |                    |
| access_token    | VARCHAR      | NULL              |                    |
| refresh_token   | VARCHAR      | NULL              |                    |
| expires_at      | DATETIME     | NULL              |                    |

**Model:** `OAuthAccount`  
**Relationships:** Many-to-one with `user`

---

## Indexes

- `admin_users.username` — UNIQUE
- `contacts` — (no unique index besides id)
- `tours.slug` — UNIQUE
- `tour_date.tour_id` — FK index
- `blog_posts.slug` — UNIQUE
- `events.slug` — UNIQUE
- `events.start_date` — INDEX
- `events.is_visible` — INDEX
- `users.email` — UNIQUE (SiteUser)
- `user.email` — UNIQUE, INDEX
- `oauth_accounts.user_id` — FK index
