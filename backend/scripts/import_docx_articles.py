#!/usr/bin/env python3
"""
Script to import blog posts from .docx files into the database.
Converts .docx to HTML, extracts images, and saves to database.

Usage: python scripts/import_docx_articles.py [content_dir] [--update] [--media-base-url URL]
Default content_dir: ../frontend/public/content
Default media_base_url: https://yourdomain.com/media/articles
Default images_dir: /var/www/anastasia/media/articles
"""
import math
import mimetypes
import os
import re
import sys
import uuid
from pathlib import Path
from typing import Optional

try:
    import mammoth
    from bs4 import BeautifulSoup
    MAMMOTH_AVAILABLE = True
except ImportError:
    MAMMOTH_AVAILABLE = False
    print("⚠ Warning: mammoth or beautifulsoup4 not installed.")
    print("  Install with: uv pip install mammoth beautifulsoup4 lxml")

from sqlalchemy import text
from sqlmodel import Session, select

from app.core.config import settings
from app.core.db import engine
from app.models import BlogPost
from app.ssh_util import ssh_tunnel


# Configuration
# Default: use local directory for development
# Override with --media-dir for production
_script_dir = Path(__file__).parent
_backend_dir = _script_dir.parent
_project_root = _backend_dir.parent
MEDIA_BASE_DIR = _project_root / "frontend" / "public" / "media" / "articles"
MEDIA_BASE_URL = "/media/articles"  # Relative URL for local dev

# Production defaults (can be overridden via command line)
PRODUCTION_MEDIA_DIR = Path("/var/www/anastasia/media/articles")
PRODUCTION_MEDIA_URL = "https://yourdomain.com/media/articles"  # Update this to your domain


def create_slug_from_filename(filename: str) -> str:
    """
    Create slug from filename by removing .docx extension.
    """
    return filename.replace(".docx", "").replace(".doc", "")


def docx_to_html_with_images(
    docx_path: Path,
    images_dir: Path,
    public_base_url: str,
) -> tuple[str, list[str]]:
    """
    Convert .docx file to HTML and extract images.
    
    Args:
        docx_path: Path to .docx file
        images_dir: Directory to save images
        public_base_url: Base URL for images (e.g., "https://domain.com/media/articles/slug")
    
    Returns:
        Tuple of (html_content, list_of_warnings)
    """
    if not MAMMOTH_AVAILABLE:
        raise ImportError("mammoth is not installed")
    
    # Create images directory
    images_dir.mkdir(parents=True, exist_ok=True)
    
    def convert_image(image):
        """
        Convert embedded image to file and return URL.
        """
        # Get image extension from content type
        ext = mimetypes.guess_extension(image.content_type) or ".bin"
        if ext == ".bin":
            # Try to determine from content type string
            if "png" in image.content_type.lower():
                ext = ".png"
            elif "jpeg" in image.content_type.lower() or "jpg" in image.content_type.lower():
                ext = ".jpg"
            elif "gif" in image.content_type.lower():
                ext = ".gif"
            elif "webp" in image.content_type.lower():
                ext = ".webp"
        
        # Generate unique filename
        filename = f"{uuid.uuid4().hex}{ext}"
        out_path = images_dir / filename
        
        # Save image
        with image.open() as f:
            data = f.read()
        with open(out_path, "wb") as out:
            out.write(data)
        
        # Return URL for HTML
        image_url = f"{public_base_url.rstrip('/')}/{filename}"
        return {"src": image_url}
    
    # Convert .docx to HTML
    with open(docx_path, "rb") as docx_file:
        result = mammoth.convert_to_html(
            docx_file,
            convert_image=mammoth.images.img_element(convert_image)
        )
    
    html = result.value
    warnings = [str(w) for w in result.messages]
    
    return html, warnings


def extract_meta_from_html(html: str) -> tuple[str, str, int]:
    """
    Extract title, description, and reading time from HTML.
    
    Returns:
        Tuple of (title, description, reading_time_minutes)
    """
    soup = BeautifulSoup(html, "lxml")
    
    # Extract title: first h1, or first h2, or first line of text
    title = None
    h1 = soup.find("h1")
    if h1:
        title = h1.get_text(" ", strip=True)
    
    if not title:
        h2 = soup.find("h2")
        if h2:
            title = h2.get_text(" ", strip=True)
    
    if not title:
        # Get first non-empty paragraph or text
        for tag in soup.find_all(["p", "div", "span"]):
            text_content = tag.get_text(" ", strip=True)
            if len(text_content) >= 10:
                title = text_content[:255]  # Limit to max_length
                break
    
    if not title:
        title = "Untitled"
    
    # Extract description: first meaningful paragraph (40+ chars)
    description = ""
    for p in soup.find_all("p"):
        text_content = p.get_text(" ", strip=True)
        if len(text_content) >= 40:
            description = text_content
            break
    
    # Limit description to 220 characters
    if description:
        description = description[:220]
    
    # Calculate reading time: words / 220 (average reading speed)
    text_content = soup.get_text(" ", strip=True)
    words = len(re.findall(r"\w+", text_content))
    reading_minutes = max(1, math.ceil(words / 220))
    
    return title, description, reading_minutes


def sanitize_html(html: str) -> str:
    """
    Sanitize HTML to allow only safe tags.
    This is a basic sanitizer - for production, consider using bleach or similar.
    """
    soup = BeautifulSoup(html, "lxml")
    
    # Allowed tags
    allowed_tags = {
        "p", "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li",
        "strong", "em", "b", "i", "u",
        "a", "img", "blockquote", "br", "hr",
        "div", "span", "table", "tr", "td", "th", "thead", "tbody"
    }
    
    # Remove script, style, and other potentially dangerous tags
    for tag in soup.find_all():
        if tag.name not in allowed_tags:
            tag.unwrap()  # Remove tag but keep content
        elif tag.name == "a":
            # Ensure links have href
            if not tag.get("href"):
                tag.unwrap()
        elif tag.name == "img":
            # Ensure images have src
            if not tag.get("src"):
                tag.decompose()
    
    return str(soup)


def import_docx_article(
    file_path: Path,
    session: Session,
    update_existing: bool = False,
    media_base_url: str = MEDIA_BASE_URL,
    media_base_dir: Path = MEDIA_BASE_DIR,
) -> None:
    """
    Import a single .docx article.
    """
    if not file_path.exists():
        print(f"⚠ File not found: {file_path}")
        return
    
    # Create slug from filename
    slug = create_slug_from_filename(file_path.name)
    
    # Create images directory for this article
    article_images_dir = media_base_dir / slug
    article_public_url = f"{media_base_url.rstrip('/')}/{slug}"
    
    # Convert .docx to HTML
    try:
        html_content, warnings = docx_to_html_with_images(
            file_path,
            article_images_dir,
            article_public_url
        )
        
        if warnings:
            print(f"⚠ Warnings for {file_path.name}:")
            for warning in warnings:
                print(f"   - {warning}")
    except Exception as e:
        print(f"❌ Error converting {file_path.name}: {e}")
        return
    
    if not html_content or not html_content.strip():
        print(f"⚠ Skipping {file_path.name}: empty content")
        return
    
    # Sanitize HTML
    html_content = sanitize_html(html_content)
    
    # Extract metadata
    title, description, reading_time_minutes = extract_meta_from_html(html_content)
    
    # Ensure title and slug are within limits
    if len(title) > 255:
        print(f"⚠ Warning: {file_path.name} title is too long, truncating")
        title = title[:255]
    
    if len(slug) > 255:
        print(f"⚠ Warning: {file_path.name} slug is too long, truncating")
        slug = slug[:255]
    
    # Check content length (current max_length=10000)
    MAX_CONTENT_LENGTH = 10000
    if len(html_content) > MAX_CONTENT_LENGTH:
        print(f"⚠ Warning: {file_path.name} content is too long ({len(html_content)} chars)")
        print(f"   Content will be truncated to {MAX_CONTENT_LENGTH} chars")
        print(f"   Consider increasing content field size in database")
        html_content = html_content[:MAX_CONTENT_LENGTH]
    
    # Check if post already exists
    try:
        existing_post = session.exec( 
            select(BlogPost).where(BlogPost.slug == slug)
        ).first()
    except Exception as e:
        session.rollback()
        raise e
    
    if existing_post:
        if update_existing:
            # Update existing post
            try:
                existing_post.title = title
                existing_post.content = html_content
                existing_post.description = description if description else None
                existing_post.reading_time_minutes = reading_time_minutes
                session.add(existing_post)
                session.commit()
                print(f"✓ Updated: {slug} ({title})")
            except Exception as e:
                session.rollback()
                raise e
        else:
            print(f"⊘ Skipping {slug}: already exists (use --update to overwrite)")
    else:
        # Create new post
        try:
            new_post = BlogPost(
                title=title,
                content=html_content,
                slug=slug,
                description=description if description else None,
                reading_time_minutes=reading_time_minutes,
            )
            session.add(new_post)
            session.commit()
            print(f"✓ Created: {slug} ({title})")
            print(f"   Images saved to: {article_images_dir}")
        except Exception as e:
            session.rollback()
            raise e


def check_database_connection() -> bool:
    """
    Check if database connection is available.
    """
    try:
        if settings.ENVIRONMENT == "local":
            with ssh_tunnel():
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
        else:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print()
        print("💡 Troubleshooting:")
        if settings.ENVIRONMENT == "local":
            print("   - Make sure SSH tunnel can be established")
            print("   - Check your ~/.ssh/config for 'vps_server' alias")
            print("   - Verify PostgreSQL is running on the remote server")
        else:
            print("   - Check if PostgreSQL server is running")
            print(f"   - Verify connection settings: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}")
        print()
        return False


def import_all_articles(
    content_dir: Path,
    update_existing: bool = False,
    media_base_url: str = MEDIA_BASE_URL,
    media_base_dir: Path = MEDIA_BASE_DIR,
) -> None:
    """
    Import all .docx files from content directory.
    """
    if not content_dir.exists():
        print(f"❌ Error: Directory {content_dir} does not exist")
        sys.exit(1)
    
    # Check database connection first
    print("🔌 Checking database connection...")
    if not check_database_connection():
        print("❌ Cannot proceed without database connection")
        sys.exit(1)
    print("✓ Database connection successful")
    print()
    
    # Check media directory
    print(f"📁 Media directory: {media_base_dir}")
    if not media_base_dir.exists():
        print(f"⚠ Warning: Media directory does not exist, will create: {media_base_dir}")
        try:
            media_base_dir.mkdir(parents=True, exist_ok=True)
            print("✓ Media directory created")
        except PermissionError:
            print(f"❌ Error: Cannot create media directory. Check permissions.")
            print(f"   Try: sudo mkdir -p {media_base_dir}")
            print(f"   Then: sudo chown -R $USER:$USER {media_base_dir}")
            print()
            print("💡 For local development, you can use a local directory:")
            print(f"   --media-dir ./local_media/articles")
            sys.exit(1)
    else:
        # Check write permissions
        if not os.access(media_base_dir, os.W_OK):
            print(f"⚠ Warning: No write permission to {media_base_dir}")
            print(f"   Try: sudo chown -R $USER:$USER {media_base_dir}")
    print()
    
    # Find all .docx files
    docx_files = list(content_dir.glob("*.docx"))
    
    if not docx_files:
        print(f"⚠ No .docx files found in {content_dir}")
        return
    
    print(f"📚 Found {len(docx_files)} .docx file(s)")
    print(f"🌐 Media base URL: {media_base_url}")
    print()
    
    # Import files with proper connection handling
    def import_with_session(file_path: Path, update_existing: bool) -> None:
        """Import a single file with its own session to isolate errors."""
        try:
            if settings.ENVIRONMENT == "local":
                with ssh_tunnel():
                    with Session(engine) as session:
                        import_docx_article(
                            file_path,
                            session,
                            update_existing,
                            media_base_url,
                            media_base_dir,
                        )
            else:
                with Session(engine) as session:
                    import_docx_article(
                        file_path,
                        session,
                        update_existing,
                        media_base_url,
                        media_base_dir,
                    )
        except Exception as e:
            print(f"❌ Error importing {file_path.name}: {e}")
    
    # Process each file separately to avoid transaction issues
    try:
        for file_path in docx_files:
            import_with_session(file_path, update_existing)
    except Exception as e:
        print(f"❌ Fatal error during import: {e}")
        sys.exit(1)
    
    print()
    print("✅ Import completed!")


if __name__ == "__main__":
    if not MAMMOTH_AVAILABLE:
        print("❌ Required packages not installed.")
        print("   Install with: uv pip install mammoth beautifulsoup4 lxml")
        sys.exit(1)
    
    # Determine content directory and media settings
    content_dir_arg = None
    media_url_arg = None
    media_dir_arg = None
    
    for i, arg in enumerate(sys.argv[1:], 1):
        if arg in ["--update", "-u"]:
            continue
        elif arg.startswith("--media-base-url="):
            media_url_arg = arg.split("=", 1)[1]
        elif arg.startswith("--media-url="):
            media_url_arg = arg.split("=", 1)[1]
        elif arg.startswith("--media-dir="):
            media_dir_arg = Path(arg.split("=", 1)[1])
        elif not arg.startswith("-"):
            content_dir_arg = arg
    
    if content_dir_arg:
        content_dir = Path(content_dir_arg)
    else:
        # Default: frontend/public/content relative to backend directory
        script_dir = Path(__file__).parent
        backend_dir = script_dir.parent
        project_root = backend_dir.parent
        content_dir = project_root / "frontend" / "public" / "content"
    
    # Check for --update flag
    update_existing = "--update" in sys.argv or "-u" in sys.argv
    
    # Media base URL and directory
    media_base_url = media_url_arg if media_url_arg else MEDIA_BASE_URL
    media_base_dir = media_dir_arg if media_dir_arg else MEDIA_BASE_DIR
    
    if update_existing:
        print("🔄 Update mode: existing posts will be updated")
    else:
        print("➕ Create mode: existing posts will be skipped")
    
    print(f"📁 Content directory: {content_dir}")
    print()
    
    import_all_articles(content_dir, update_existing, media_base_url, media_base_dir)

