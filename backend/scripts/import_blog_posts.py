#!/usr/bin/env python3
"""
Script to import blog posts from markdown and Word (.doc, .docx) files into the database.
Usage: python scripts/import_blog_posts.py [content_dir] [--update]
Default content_dir: ../frontend/public/content
"""
import re
import sys
from pathlib import Path
from typing import Optional

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

from sqlalchemy import text
from sqlmodel import Session, select

from app.core.config import settings
from app.core.db import engine
from app.models import BlogPost
from app.ssh_util import ssh_tunnel


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """
    Parse frontmatter from markdown file.
    Returns tuple of (frontmatter_dict, content_without_frontmatter).
    """
    # Check if file starts with frontmatter
    if not content.startswith("---"):
        return {}, content
    
    # Find the end of frontmatter
    lines = content.split("\n")
    if lines[0].strip() != "---":
        return {}, content
    
    frontmatter_lines = []
    content_start = 1
    
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            content_start = i + 1
            break
        frontmatter_lines.append(line)
    
    # Parse frontmatter as key-value pairs
    frontmatter = {}
    for line in frontmatter_lines:
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            frontmatter[key] = value
    
    # Get content without frontmatter
    content_without_frontmatter = "\n".join(lines[content_start:]).strip()
    
    return frontmatter, content_without_frontmatter


def parse_reading_time(reading_time_str: str) -> Optional[int]:
    """
    Parse reading time string to minutes.
    Handles formats like: "2 мин", "1 мин.", "2 минуты", "5 min", etc.
    """
    if not reading_time_str:
        return None
    
    # Extract number from string
    match = re.search(r"\d+", reading_time_str)
    if match:
        return int(match.group())
    
    return None


def create_slug_from_filename(filename: str) -> str:
    """
    Create slug from filename by removing file extension.
    """
    # Remove common extensions
    for ext in [".md", ".docx", ".doc"]:
        if filename.endswith(ext):
            return filename[:-len(ext)]
    return filename


def read_docx_file(file_path: Path) -> tuple[dict, str]:
    """
    Read .docx file and extract content.
    Returns tuple of (frontmatter_dict, content_text).
    
    For .docx files, we assume:
    - First paragraph might be title
    - Content is all paragraphs combined
    - No frontmatter support (can be extended if needed)
    """
    if not DOCX_AVAILABLE:
        raise ImportError("python-docx is not installed")
    
    doc = Document(file_path)
    
    # Extract all paragraphs
    paragraphs = [para.text.strip() for para in doc.paragraphs if para.text.strip()]
    
    if not paragraphs:
        return {}, ""
    
    # Use first paragraph as title if it looks like a title
    # (short, no punctuation at the end, or formatted as heading)
    title = paragraphs[0] if paragraphs else ""
    content = "\n\n".join(paragraphs)
    
    # Try to detect if first paragraph is a title
    # (heuristic: if it's short and followed by longer text)
    if len(paragraphs) > 1 and len(title) < 100:
        content = "\n\n".join(paragraphs[1:])
    else:
        # If only one paragraph or first is long, use all as content
        content = "\n\n".join(paragraphs)
        title = ""
    
    frontmatter = {}
    if title:
        frontmatter["title"] = title
    
    return frontmatter, content


def read_doc_file(file_path: Path) -> tuple[dict, str]:
    """
    Read old .doc file (binary format).
    Note: This requires additional libraries like textract or antiword.
    For now, we'll raise an error suggesting conversion.
    """
    raise NotImplementedError(
        f"Old .doc format is not directly supported. "
        f"Please convert {file_path.name} to .docx or .md format first. "
        f"You can use online converters or LibreOffice: "
        f"libreoffice --headless --convert-to docx '{file_path}'"
    )


def import_blog_post(
    file_path: Path,
    session: Session,
    update_existing: bool = False,
) -> None:
    """
    Import a single blog post from markdown or Word file.
    """
    file_ext = file_path.suffix.lower()
    
    # Read file based on extension
    if file_ext == ".md":
        # Read markdown file
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        # Parse frontmatter
        frontmatter, file_content = parse_frontmatter(content)
    elif file_ext == ".docx":
        # Read .docx file
        if not DOCX_AVAILABLE:
            print(f"⚠ Skipping {file_path.name}: python-docx not installed")
            return
        frontmatter, file_content = read_docx_file(file_path)
    elif file_ext == ".doc":
        # Try to read old .doc file
        try:
            frontmatter, file_content = read_doc_file(file_path)
        except NotImplementedError as e:
            print(f"⚠ {e}")
            return
    else:
        print(f"⚠ Skipping {file_path.name}: unsupported file format")
        return
    
    # Extract required fields
    title = frontmatter.get("title", "")
    description = frontmatter.get("description", "")
    date_str = frontmatter.get("date", "")
    reading_time_str = frontmatter.get("reading_time", "")
    
    # Create slug from filename
    slug = create_slug_from_filename(file_path.name)
    
    # Parse reading time
    reading_time_minutes = parse_reading_time(reading_time_str)
    
    # Validate required fields
    if not title:
        # For .docx files, try to extract title from first line of content
        if file_ext == ".docx" and file_content:
            lines = file_content.split("\n")
            if lines:
                title = lines[0].strip()[:255]  # Limit to max_length
                if len(lines) > 1:
                    file_content = "\n".join(lines[1:]).strip()
        
        if not title:
            print(f"⚠ Skipping {file_path.name}: missing title")
            return
    
    if not file_content:
        print(f"⚠ Skipping {file_path.name}: empty content")
        return
    
    # Check content length (max_length=10000 for content field)
    MAX_CONTENT_LENGTH = 10000
    if len(file_content) > MAX_CONTENT_LENGTH:
        print(f"⚠ Warning: {file_path.name} content is too long ({len(file_content)} chars), truncating to {MAX_CONTENT_LENGTH} chars")
        file_content = file_content[:MAX_CONTENT_LENGTH]
    
    # Ensure title and slug are within limits
    if len(title) > 255:
        print(f"⚠ Warning: {file_path.name} title is too long, truncating")
        title = title[:255]
    
    if len(slug) > 255:
        print(f"⚠ Warning: {file_path.name} slug is too long, truncating")
        slug = slug[:255]
    
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
                existing_post.content = file_content
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
                content=file_content,
                slug=slug,
                description=description if description else None,
                reading_time_minutes=reading_time_minutes,
            )
            session.add(new_post)
            session.commit()
            print(f"✓ Created: {slug} ({title})")
        except Exception as e:
            session.rollback()
            raise e


def check_database_connection() -> bool:
    """
    Check if database connection is available.
    Returns True if connection is successful, False otherwise.
    """
    try:
        if settings.ENVIRONMENT == "local":
            # In local environment, use SSH tunnel
            with ssh_tunnel():
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
        else:
            # In production/staging, connect directly
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


def import_all_posts(content_dir: Path, update_existing: bool = False) -> None:
    """
    Import all markdown and Word files from content directory.
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
    
    # Find all supported files
    md_files = list(content_dir.glob("*.md"))
    docx_files = list(content_dir.glob("*.docx")) if DOCX_AVAILABLE else []
    doc_files = list(content_dir.glob("*.doc"))
    
    all_files = md_files + docx_files + doc_files
    
    if not all_files:
        print(f"⚠ No supported files (.md, .docx, .doc) found in {content_dir}")
        return
    
    print(f"📚 Found {len(all_files)} file(s):")
    print(f"   - {len(md_files)} markdown file(s)")
    if DOCX_AVAILABLE:
        print(f"   - {len(docx_files)} .docx file(s)")
    else:
        if docx_files:
            print(f"   - {len(docx_files)} .docx file(s) (skipped - python-docx not installed)")
            print("     Install with: uv pip install python-docx")
    if doc_files:
        print(f"   - {len(doc_files)} .doc file(s) (old format - conversion required)")
    print()
    
    # Import files with proper connection handling
    # Create a new session for each file to isolate errors
    def import_with_session(file_path: Path, update_existing: bool) -> None:
        """Import a single file with its own session to isolate errors."""
        try:
            with Session(engine) as session:
                import_blog_post(file_path, session, update_existing)
        except Exception as e:
            # Error is already handled in import_blog_post with rollback
            print(f"❌ Error importing {file_path.name}: {e}")
            # Continue with next file
    
    # Process each file separately to avoid transaction issues
    try:
        if settings.ENVIRONMENT == "local":
            # In local environment, use SSH tunnel for all files
            with ssh_tunnel():
                for file_path in all_files:
                    import_with_session(file_path, update_existing)
        else:
            # In production/staging, connect directly
            for file_path in all_files:
                import_with_session(file_path, update_existing)
    except Exception as e:
        print(f"❌ Fatal error during import: {e}")
        sys.exit(1)
    
    print()
    print("✅ Import completed!")


if __name__ == "__main__":
    # Determine content directory
    if len(sys.argv) > 1:
        content_dir = Path(sys.argv[1])
    else:
        # Default: frontend/public/content relative to backend directory
        script_dir = Path(__file__).parent
        backend_dir = script_dir.parent
        project_root = backend_dir.parent
        content_dir = project_root / "frontend" / "public" / "content"
    
    # Check for --update flag
    update_existing = "--update" in sys.argv or "-u" in sys.argv
    
    if update_existing:
        print("🔄 Update mode: existing posts will be updated")
    else:
        print("➕ Create mode: existing posts will be skipped")
    
    print(f"📁 Content directory: {content_dir}")
    print()
    
    import_all_posts(content_dir, update_existing)

