from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep
from app.models import BlogPost, BlogPostPublic, BlogPostsPublic

router = APIRouter(prefix="/blog-posts", tags=["blog-posts"])


@router.get("/", response_model=BlogPostsPublic)
def read_blog_posts(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve blog posts with pagination.
    Returns list of blog posts ordered by creation date (newest first).
    """
    # Count total posts
    count_statement = select(func.count()).select_from(BlogPost)
    count = session.exec(count_statement).one()

    # Get posts with pagination, ordered by created_at descending
    statement = (
        select(BlogPost)
        .order_by(BlogPost.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    posts = session.exec(statement).all()

    return BlogPostsPublic(data=posts, count=count)


@router.get("/{slug}", response_model=BlogPostPublic)
def read_blog_post_by_slug(
    slug: str,
    session: SessionDep,
) -> Any:
    """
    Retrieve a specific blog post by slug.
    Returns blog post details.
    """
    statement = select(BlogPost).where(BlogPost.slug == slug)
    post = session.exec(statement).first()

    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    return post
