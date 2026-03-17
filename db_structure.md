# Database Structure

Single source of truth for the database schema. Use this file to validate queries, ORM models, and migrations.

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

| Column              | Type         | Constraints       | Description        |
|---------------------|--------------|-------------------|--------------------|
| id                  | INTEGER      | PRIMARY KEY, AUTO |                    |
| title               | VARCHAR(255) | NOT NULL          |                    |
| content             | TEXT         | NOT NULL          | HTML with Base64   |
| slug                | VARCHAR(255) | UNIQUE, NOT NULL  |                    |
| description         | VARCHAR      | NULL              |                    |
| keywords            | VARCHAR      | NULL              |                    |
| image               | VARCHAR      | NULL              |                    |
| reading_time_minutes| INTEGER      | NULL              |                    |
| created_at          | DATETIME     | DEFAULT now()     |                    |
| updated_at          | DATETIME     | DEFAULT now()     |                    |

**Model:** `BlogPost`

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
- `users.email` — UNIQUE (SiteUser)
- `user.email` — UNIQUE, INDEX
- `oauth_accounts.user_id` — FK index
