from datetime import date
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Tour(SQLModel, table=True):
    __tablename__ = "tours"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    duration: int
    cost: str = Field(max_length=50)
    additional_cost: str = Field(max_length=50)
    meeting_point: str = Field(max_length=255)
    description: str = Field(max_length=1000)
    additional_description: str = Field(max_length=1000)
    max_capacity: Optional[int] = None
    slug: str = Field(unique=True, max_length=255)

    dates: list["TourDate"] = Relationship(back_populates="tour")

    def __str__(self):
        return self.name


class TourDate(SQLModel, table=True):
    __tablename__ = "tour_date"

    id: Optional[int] = Field(default=None, primary_key=True)
    tour_id: int = Field(foreign_key="tours.id")
    date: date
    time: str = Field(max_length=50)

    tour: Optional[Tour] = Relationship(back_populates="dates")
