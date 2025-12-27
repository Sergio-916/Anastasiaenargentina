
from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import select
from datetime import date

from app.api.deps import SessionDep
from app.models import Tour, TourDate
from pydantic import BaseModel

router = APIRouter()


class ScheduledTourResponse(BaseModel):
    """Response model for scheduled tours with dates"""
    name: str
    slug: str
    date_id: int
    raw_date: date
    time: str


class TourDetailResponse(BaseModel):
    """Response model for tour details with specific date"""
    name: str
    slug: str
    description: str
    additional_description: str
    duration: int
    cost: str
    additional_cost: str
    meeting_point: str
    max_capacity: int | None
    date: date
    time: str
    date_id: int


@router.get("/", response_model=list[ScheduledTourResponse])
def read_tours(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve scheduled tours with their dates.
    Returns tours with dates ordered by date and time.
    """
    # Join Tour and TourDate tables
    statement = (
        select(
            Tour.name,
            Tour.slug,
            TourDate.id,
            TourDate.date,
            TourDate.time
        )
        .join(TourDate, Tour.id == TourDate.tour_id)
        .order_by(TourDate.date, TourDate.time)
        .offset(skip)
        .limit(limit)
    )
    
    results = session.exec(statement).all()
    
    # Convert results to response model
    # SQLModel returns Row objects that can be accessed as tuples
    scheduled_tours = [
        ScheduledTourResponse(
            name=row[0],
            slug=row[1],
            date_id=row[2],
            raw_date=row[3],
            time=row[4]
        )
        for row in results
    ]
    
    return scheduled_tours


@router.get("/{slug}/{date_id}", response_model=TourDetailResponse)
def read_tour_by_slug_and_date(
    slug: str,
    date_id: int,
    session: SessionDep,
) -> Any:
    """
    Retrieve a specific tour by slug and date_id.
    Returns tour details with the specific date information.
    """
    # Join Tour and TourDate tables and filter by slug and date_id
    statement = (
        select(Tour, TourDate)
        .join(TourDate, Tour.id == TourDate.tour_id)
        .where(Tour.slug == slug)
        .where(TourDate.id == date_id)
    )
    
    result = session.exec(statement).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    tour, tour_date = result
    
    return TourDetailResponse(
        name=tour.name,
        slug=tour.slug,
        description=tour.description,
        additional_description=tour.additional_description,
        duration=tour.duration,
        cost=tour.cost,
        additional_cost=tour.additional_cost,
        meeting_point=tour.meeting_point,
        max_capacity=tour.max_capacity,
        date=tour_date.date,
        time=tour_date.time,
        date_id=tour_date.id,
    )

