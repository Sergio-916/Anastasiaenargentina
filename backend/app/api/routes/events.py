from datetime import date, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy import and_, or_
from sqlmodel import col, func, select

from app.api.deps import SessionDep
from app.core.config import settings
from app.models import Event, EventPublic, EventsPublic

router = APIRouter(prefix="/events", tags=["events"])


def ensure_events_enabled() -> None:
    if not settings.FEATURE_SHOW_EVENTS:
        raise HTTPException(status_code=404, detail="Events are not available")


def active_events_filter():
    today = date.today()
    current_week_start = today - timedelta(days=today.weekday())

    return or_(
        and_(
            col(Event.is_long_term).is_(False),
            func.coalesce(Event.end_date, Event.start_date) >= current_week_start,
        ),
        and_(
            col(Event.is_long_term).is_(True),
            or_(
                col(Event.end_date).is_(None),
                Event.end_date >= today,
            ),
        ),
    )


@router.get("/", response_model=EventsPublic)
def read_events(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve visible events for the public site.
    """
    ensure_events_enabled()

    count_statement = (
        select(func.count())
        .select_from(Event)
        .where(col(Event.is_visible).is_(True), active_events_filter())
    )
    count = session.exec(count_statement).one()

    statement = (
        select(Event)
        .where(col(Event.is_visible).is_(True), active_events_filter())
        .order_by(col(Event.start_date), col(Event.start_time_local), col(Event.title))
        .offset(skip)
        .limit(limit)
    )
    events = session.exec(statement).all()

    return EventsPublic(data=events, count=count)


@router.get("/{slug}", response_model=EventPublic)
def read_event_by_slug(
    slug: str,
    session: SessionDep,
) -> Any:
    """
    Retrieve one visible event by slug for the public site.
    """
    ensure_events_enabled()

    statement = select(Event).where(
        Event.slug == slug,
        col(Event.is_visible).is_(True),
        active_events_filter(),
    )
    event = session.exec(statement).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return event
