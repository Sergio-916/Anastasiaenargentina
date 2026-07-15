from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class BlogPost(SQLModel, table=True):
    __tablename__ = "blog_posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    slug: str = Field(unique=True, max_length=255)
    content_markdown: str
    description: Optional[str] = None
    keywords: Optional[str] = None
    cover_image_url: Optional[str] = None
    reading_time_minutes: Optional[int] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

    def __str__(self):
        return self.title


class BlogPostListItem(SQLModel):
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    reading_time_minutes: Optional[int] = None
    created_at: Optional[datetime] = None


class BlogPostPublic(SQLModel):
    id: int
    title: str
    slug: str
    content_markdown: str
    description: Optional[str] = None
    keywords: Optional[str] = None
    cover_image_url: Optional[str] = None
    reading_time_minutes: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class BlogPostsPublic(SQLModel):
    data: list[BlogPostListItem]
    count: int
