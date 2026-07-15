from datetime import date, datetime
from decimal import Decimal

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True, max_length=255)
    title: str = Field(max_length=255)
    category: str = Field(max_length=100)
    summary_short: str = Field(sa_column=sa.Column(sa.Text, nullable=False))
    summary_long: str = Field(sa_column=sa.Column(sa.Text, nullable=False))
    start_date: date = Field(index=True)
    end_date: date | None = None
    start_time_local: str | None = Field(default=None, max_length=20)
    end_time_local: str | None = Field(default=None, max_length=20)
    timezone: str = Field(max_length=100)
    venue_name: str | None = Field(default=None, max_length=255)
    venue_address: str | None = Field(default=None, max_length=255)
    neighborhood: str | None = Field(default=None, max_length=100)
    city: str = Field(max_length=100)
    country: str = Field(max_length=100)
    language: str = Field(max_length=10)
    price_type: str = Field(max_length=50)
    price_currency: str | None = Field(default=None, max_length=10)
    price_value: Decimal | None = Field(
        default=None,
        sa_column=sa.Column(sa.Numeric, nullable=True),
    )
    ticket_url: str | None = Field(
        default=None,
        sa_column=sa.Column(sa.Text, nullable=True),
    )
    official_url: str | None = Field(
        default=None,
        sa_column=sa.Column(sa.Text, nullable=True),
    )
    image_primary_url: str | None = Field(
        default=None,
        sa_column=sa.Column(sa.Text, nullable=True),
    )
    image_alt: str | None = Field(default=None, max_length=500)
    image_credit: str | None = Field(default=None, max_length=255)
    tags: list[str] | None = Field(
        default=None,
        sa_column=sa.Column(sa.JSON, nullable=True),
    )
    source_urls: list[str] | None = Field(
        default=None,
        sa_column=sa.Column(sa.JSON, nullable=True),
    )
    status: str = Field(max_length=50)
    source_batch: str | None = Field(default=None, max_length=100)
    source_generated_at: datetime | None = None
    is_long_term: bool = Field(default=False)
    is_visible: bool = Field(default=False, index=True)
    created_at: datetime | None = Field(default_factory=datetime.now)
    updated_at: datetime | None = Field(default_factory=datetime.now)

    def __str__(self) -> str:
        return self.title


class EventPublic(SQLModel):
    id: int
    slug: str
    title: str
    category: str
    summary_short: str
    summary_long: str
    start_date: date
    end_date: date | None = None
    start_time_local: str | None = None
    end_time_local: str | None = None
    timezone: str
    venue_name: str | None = None
    venue_address: str | None = None
    neighborhood: str | None = None
    city: str
    country: str
    language: str
    price_type: str
    price_currency: str | None = None
    price_value: Decimal | None = None
    ticket_url: str | None = None
    official_url: str | None = None
    image_primary_url: str | None = None
    image_alt: str | None = None
    image_credit: str | None = None
    tags: list[str] | None = None
    source_urls: list[str] | None = None
    status: str
    is_long_term: bool


class EventsPublic(SQLModel):
    data: list[EventPublic]
    count: int
