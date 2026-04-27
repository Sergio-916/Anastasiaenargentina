# Agent Guide: Anastasia Site (Dynamic)

Compact instructions for agents working in this repository.

## Repository Structure

- `backend/`: FastAPI application.
- `frontend/`: Next.js application (JavaScript, Chakra UI).
- `db_structure.md`: **Source of truth** for the database schema. Validate ORM models and migrations against this file.
- `.env`: Should be located in the **root directory** (one level above `backend/`).

## Backend (Python)

### Tooling & Commands
- **Manager**: `uv`.
- **Sync**: `uv sync` (run from `backend/`).
- **Tests**: `bash ./scripts/test.sh` or `pytest`.
- **Lint/Format**: `bash ./scripts/lint.sh`, `bash ./scripts/format.sh`.
- **Migrations**: `alembic revision --autogenerate -m "description"`, `alembic upgrade head`.

### Key Locations
- **Models**: `backend/app/models.py` (SQLModel).
- **API**: `backend/app/api/` (main router in `backend/app/api/main.py`).
- **CRUD**: `backend/app/crud.py`.
- **Admin**: `backend/app/admin.py` (SQLAdmin).
- **Static Media**: `backend/data/blog_media/` (served at `/blog-media`).

### Operational Gotchas
- **SSH Tunnel**: Local development might auto-start an SSH tunnel if `POSTGRES_SERVER` is not local (see `backend/app/main.py` lifespan).
- **Monkeypatch**: `StarletteRequest.form` is patched in `main.py` to increase `max_part_size` to 50MB for large admin uploads.
- **Ambiguous Models**: 
    - `SiteUser` (table `users`): Used by the site frontend.
    - `User` (table `user`): Part of the original template, used for admin/internal auth.
    - Always verify which one you need by checking `db_structure.md`.

## Frontend (Next.js)

### Tooling & Commands
- **Manager**: `npm`.
- **Scripts**: `npm run dev`, `npm run build`, `npm run lint`.
- **UI Framework**: Chakra UI.

### Key Locations
- **Pages/Routes**: `frontend/src/app/` (App Router).
- **Components**: `frontend/src/app/components/`.
- **Contexts**: `frontend/src/contexts/`.

## Workflow Rules

1. **DB Changes**: Update `db_structure.md` FIRST, then modify `backend/app/models.py`, then run `alembic revision --autogenerate`.
2. **Pathing**: Always use absolute paths with tools.
3. **JS vs TS**: Frontend is primarily JavaScript (`.js` files) despite `middleware.ts`. Do not introduce TypeScript unless requested.
4. **Imports**: Backend uses absolute imports (e.g., `from app.models import ...`).

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
