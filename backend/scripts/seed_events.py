#!/usr/bin/env python3
"""
Seed events from backend/data/events JSON files.

Usage:
    python scripts/seed_events.py [--file PATH] [--force] [--hidden] [--dry-run] [--production]

By default, existing events are skipped and imported events are public
(`is_visible=true`). Use --force to update existing records and --hidden to
import records without showing them on the public site.
"""

# ruff: noqa: E402, T201
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlmodel import Session, select

_script_dir = Path(__file__).parent
_backend_dir = _script_dir.parent
sys.path.insert(0, str(_backend_dir))


def _parse_args_early() -> argparse.Namespace:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--production", action="store_true")
    args, _ = parser.parse_known_args()
    return args


_early_args = _parse_args_early()
if _early_args.production:
    os.environ["ENVIRONMENT"] = "production"

    env_file_path = _backend_dir.parent / ".env"
    if env_file_path.exists():
        load_dotenv(env_file_path)

    postgres_url = os.getenv("POSTGRES_URL")
    if postgres_url:
        match = re.match(
            r"postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", postgres_url
        )
        if match:
            user, password, host, port, dbname = match.groups()
            os.environ["POSTGRES_USER"] = user
            os.environ["POSTGRES_PASSWORD"] = password
            os.environ["POSTGRES_SERVER"] = host
            os.environ["POSTGRES_PORT"] = port
            os.environ["POSTGRES_DB"] = dbname

from app.core.config import settings
from app.models import Event
from app.ssh_util import ssh_tunnel


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed events from JSON")
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Event JSON file (default: newest backend/data/events/*.json)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Update existing events by slug",
    )
    parser.add_argument(
        "--hidden",
        action="store_true",
        help="Set is_visible=false for imported records",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and report changes without writing to database",
    )
    parser.add_argument(
        "--production",
        action="store_true",
        help="Use production database connection without SSH tunnel",
    )
    return parser.parse_args()


def get_default_events_file() -> Path:
    events_dir = _backend_dir / "data" / "events"
    candidates = sorted(
        events_dir.glob("*.json"), key=lambda path: path.stat().st_mtime
    )
    if not candidates:
        raise FileNotFoundError(f"No event JSON files found in {events_dir}")
    return candidates[-1]


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


def parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def parse_decimal(value: object) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(value))


def load_events(file_path: Path, visible: bool) -> list[Event]:
    with file_path.open("r", encoding="utf-8") as f:
        payload: dict[str, Any] = json.load(f)

    language = str(payload.get("language") or "ru")
    source_batch = payload.get("source_batch")
    source_generated_at = parse_datetime(payload.get("generated_at"))

    events: list[Event] = []
    for collection_name, is_long_term in (
        ("events", False),
        ("long_term_events", True),
    ):
        for item in payload.get(collection_name, []):
            image = item.get("image") or {}
            start_date = parse_date(item.get("start_date"))
            if start_date is None:
                raise ValueError(f"Event {item['slug']} has no start_date")

            event = Event(
                slug=item["slug"],
                title=item["title"],
                category=item["category"],
                summary_short=item["summary_short"],
                summary_long=item["summary_long"],
                start_date=start_date,
                end_date=parse_date(item.get("end_date")),
                start_time_local=item.get("start_time_local"),
                end_time_local=item.get("end_time_local"),
                timezone=item["timezone"],
                venue_name=item.get("venue_name"),
                venue_address=item.get("venue_address"),
                neighborhood=item.get("neighborhood"),
                city=item.get("city") or payload.get("city") or "Buenos Aires",
                country=item.get("country") or payload.get("country") or "Argentina",
                language=language,
                price_type=item["price_type"],
                price_currency=item.get("price_currency"),
                price_value=parse_decimal(item.get("price_value")),
                ticket_url=item.get("ticket_url"),
                official_url=item.get("official_url"),
                image_primary_url=image.get("primary_url"),
                image_alt=image.get("alt"),
                image_credit=image.get("credit"),
                tags=item.get("tags"),
                source_urls=item.get("source_urls"),
                status=item["status"],
                source_batch=str(source_batch) if source_batch else None,
                source_generated_at=source_generated_at,
                is_long_term=is_long_term,
                is_visible=visible,
            )
            events.append(event)

    return events


def update_event(existing: Event, incoming: Event) -> None:
    data = incoming.model_dump(exclude={"id", "created_at"})
    existing.sqlmodel_update(data, update={"updated_at": datetime.now()})


def seed_events(
    session: Session,
    events: list[Event],
    *,
    force: bool,
    dry_run: bool,
) -> tuple[int, int, int]:
    created = 0
    updated = 0
    skipped = 0

    for event in events:
        existing = session.exec(select(Event).where(Event.slug == event.slug)).first()
        if existing:
            if not force:
                skipped += 1
                print(f"  - skip existing: {event.slug}")
                continue
            updated += 1
            print(f"  - update: {event.slug}")
            if not dry_run:
                update_event(existing, event)
                session.add(existing)
            continue

        created += 1
        print(f"  - create: {event.slug}")
        if not dry_run:
            session.add(event)

    if not dry_run:
        session.commit()

    return created, updated, skipped


def confirm_production_write(args: argparse.Namespace) -> None:
    if not args.production or args.dry_run:
        return

    print("Production mode: direct database connection")
    print(
        f"  Database: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    )
    print("  WARNING: this will write to production database.")
    response = input("  Continue? (yes/no): ")
    if response.lower() not in ("yes", "y"):
        print("Aborted.")
        sys.exit(0)


def _is_host_resolution_error(error: Exception) -> bool:
    error_msg = str(error).lower()
    return (
        "failed to resolve host" in error_msg
        or "nodename nor servname provided" in error_msg
    )


def _create_tunnel_engine() -> Engine:
    tunnel_uri = (
        str(settings.SQLALCHEMY_DATABASE_URI)
        .replace(f":{settings.POSTGRES_PORT}", ":5433")
        .replace(f"@{settings.POSTGRES_SERVER}:", "@127.0.0.1:")
    )
    return create_engine(tunnel_uri)


def process_with_engine(
    engine: Engine,
    args: argparse.Namespace,
    events: list[Event],
    *,
    allow_tunnel_fallback: bool = True,
) -> None:
    try:
        with engine.connect() as connection:
            db_name = connection.execute(text("SELECT current_database()")).scalar_one()
            print(f"Connected to database: {db_name}")
    except Exception as error:
        if not allow_tunnel_fallback or not _is_host_resolution_error(error):
            raise

        host = settings.POSTGRES_SERVER
        if host not in ("db", "postgres", "database"):
            raise

        print(f"\nCannot resolve database host '{host}' from this environment.")
        print("This host usually works only inside Docker networks.")
        print("Trying SSH tunnel fallback...")
        with ssh_tunnel(local_port=5433):
            print("SSH tunnel active, connecting to production database...")
            process_with_engine(
                _create_tunnel_engine(),
                args,
                events,
                allow_tunnel_fallback=False,
            )
        return

    with Session(engine) as session:
        created, updated, skipped = seed_events(
            session,
            events,
            force=args.force,
            dry_run=args.dry_run,
        )

    action = "Would import" if args.dry_run else "Imported"
    print(f"{action}: created={created}, updated={updated}, skipped={skipped}")


def main() -> None:
    args = parse_args()
    file_path = Path(args.file) if args.file else get_default_events_file()
    if not file_path.is_absolute():
        file_path = Path.cwd() / file_path

    visible = not args.hidden
    events = load_events(file_path, visible=visible)
    print(f"Loaded {len(events)} events from {file_path}")
    print(f"Default visibility for this import: {visible}")

    confirm_production_write(args)

    needs_ssh_tunnel = (
        not args.production
        and settings.ENVIRONMENT == "local"
        and settings.POSTGRES_SERVER not in ("localhost", "127.0.0.1")
    )

    if needs_ssh_tunnel:
        print("Local environment with remote database detected, creating SSH tunnel...")
        with ssh_tunnel(local_port=5433):
            tunnel_uri = (
                str(settings.SQLALCHEMY_DATABASE_URI)
                .replace(f":{settings.POSTGRES_PORT}", ":5433")
                .replace(settings.POSTGRES_SERVER, "127.0.0.1")
            )
            process_with_engine(
                create_engine(tunnel_uri),
                args,
                events,
                allow_tunnel_fallback=False,
            )
        return

    from app.core.db import engine

    process_with_engine(engine, args, events)


if __name__ == "__main__":
    main()
