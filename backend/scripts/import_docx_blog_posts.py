#!/usr/bin/env python3
"""
Script to parse .doc and .docx files from backend/data folder and save them as blog posts.

This script:
1. Scans backend/data folder for .doc and .docx files
2. Extracts text and images from each document
3. Converts documents to HTML with embedded Base64 images
4. Creates BlogPost records in the database

Usage:
    python scripts/import_docx_blog_posts.py [--force] [--dry-run] [--production] [--data-dir PATH]
    
By default, files that already exist in database (by slug) are skipped.
Use --force to re-process existing files.
Use --production to connect directly to production database (skip SSH tunnel).
Database connection uses settings from .env file via config.py (same as other parts of the app).
"""
import base64
import hashlib
import os
import re
import sys
import uuid
from pathlib import Path
from datetime import datetime
from typing import Optional
import mammoth
from sqlmodel import Session, select

# Add backend directory to sys.path
_script_dir = Path(__file__).parent
_backend_dir = _script_dir.parent
sys.path.insert(0, str(_backend_dir))

# Parse arguments first to check if --production is used
# This allows us to set ENVIRONMENT before importing settings
def _parse_args_early():
    """Parse arguments early to set ENVIRONMENT if needed."""
    import argparse
    parser = argparse.ArgumentParser(add_help=False)  # Don't show help on early parse
    parser.add_argument("--production", action="store_true")
    args, _ = parser.parse_known_args()
    return args

_early_args = _parse_args_early()
# If --production is used, set ENVIRONMENT=production before importing settings
# This ensures settings uses production environment (same approach as other parts of app)
if _early_args.production:
    os.environ["ENVIRONMENT"] = "production"
    # Load .env file to read POSTGRES_URL if it's not already in environment
    # This allows using production DB settings from POSTGRES_URL in .env
    from dotenv import load_dotenv
    env_file_path = _backend_dir.parent / ".env"
    if env_file_path.exists():
        load_dotenv(env_file_path)
    
    postgres_url = os.getenv("POSTGRES_URL")
    if postgres_url:
        # Parse POSTGRES_URL to extract connection parameters
        # Format: postgresql://user:password@host:port/dbname
        import re
        match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', postgres_url)
        if match:
            user, password, host, port, dbname = match.groups()
            # Set individual environment variables (Pydantic Settings will use them)
            os.environ["POSTGRES_USER"] = user
            os.environ["POSTGRES_PASSWORD"] = password
            os.environ["POSTGRES_SERVER"] = host
            os.environ["POSTGRES_PORT"] = port
            os.environ["POSTGRES_DB"] = dbname

from app.core.config import settings
from app.models import BlogPost
from app.ssh_util import ssh_tunnel


def parse_args():
    """Parse command line arguments."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Import .doc/.docx files as blog posts"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-processing of files even if they already exist in database",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse files but don't save to database",
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default=None,
        help="Path to data directory (default: backend/data)",
    )
    parser.add_argument(
        "--production",
        action="store_true",
        help="Use production database connection (skip SSH tunnel, use direct connection from settings)",
    )
    return parser.parse_args()


def convert_docx_to_html_with_images(
    file_path: Path, data_dir: Path
) -> tuple[str, list[str]]:
    """
    Convert docx file to HTML using mammoth, embedding images as Base64 data URIs.
    Images are embedded directly in HTML, no need to save them separately.
    Returns tuple of (html_content, empty list - images are in HTML).
    """
    # Convert docx to HTML using mammoth with data_uri converter (embeds images as base64)
    with open(file_path, "rb") as docx_file:
        # Use mammoth's built-in data_uri converter to embed images as base64
        result = mammoth.convert_to_html(
            docx_file,
            convert_image=mammoth.images.data_uri
        )
        html_content = result.value
        
    messages = result.messages
    
    # Print any conversion warnings
    if messages:
        for message in messages:
            if message.type == "warning":
                print(f"    Warning: {message.message}")
    
    # Debug: Check if HTML contains img tags
    if "<img" not in html_content.lower():
        print(f"    Warning: No <img> tags found in generated HTML")
        print(f"    HTML preview (first 500 chars): {html_content[:500]}")
    else:
        img_count = html_content.lower().count("<img")
        print(f"    Found {img_count} image(s) embedded in HTML as Base64")
    
    # Return empty list for image_paths since images are embedded in HTML
    return html_content, []


def transliterate(text: str) -> str:
    """
    Transliterate Russian (Cyrillic) text to English (Latin) characters.
    Uses standard transliteration mapping.
    """
    # Multi-character transliteration (must be done first)
    multi_char_replacements = {
        'ё': 'yo', 'ж': 'zh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ю': 'yu', 'я': 'ya',
        'Ё': 'Yo', 'Ж': 'Zh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
        'Ю': 'Yu', 'Я': 'Ya',
    }
    
    # Single character transliteration using str.translate() (more efficient)
    single_char_translation = str.maketrans({
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E',
        'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'H', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E',
    })
    
    # Apply multi-character replacements first, then single character translation
    result = text
    for cyrillic, latin in multi_char_replacements.items():
        result = result.replace(cyrillic, latin)
    
    return result.translate(single_char_translation)


def generate_slug(filename: str) -> str:
    """Generate URL-friendly slug from filename with transliteration."""
    # Remove extension
    name = Path(filename).stem
    # Transliterate Russian to English
    name = transliterate(name)
    # Convert to lowercase
    name = name.lower()
    # Replace spaces and special characters with hyphens
    # Keep only alphanumeric, hyphens, and spaces
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[-\s]+", "-", name)
    # Remove leading/trailing hyphens
    name = name.strip("-")
    return name


def calculate_reading_time(content: str) -> int:
    """Calculate reading time in minutes (assuming 200 words per minute)."""
    word_count = len(content.split())
    return max(1, round(word_count / 200))


def parse_docx_file(file_path: Path, data_dir: Path) -> dict:
    """
    Parse a .docx file and return blog post data with HTML content.
    Returns dict with: title, content (HTML), slug, description, keywords, image, reading_time_minutes, image_paths
    
    Note: Only .docx files are supported. For .doc files, convert them to .docx first.
    """
    # Check file extension
    if file_path.suffix.lower() == ".doc":
        raise ValueError(
            "Old .doc format is not supported. Please convert the file to .docx format first."
        )
    
    # Convert docx to HTML with images
    try:
        html_content, image_paths = convert_docx_to_html_with_images(file_path, data_dir)
    except Exception as e:
        raise ValueError(f"Failed to convert document to HTML: {e}") from e

    if not html_content.strip():
        raise ValueError("Document is empty")

    # Generate slug from filename
    slug = generate_slug(file_path.name)

    # Extract title from HTML (first heading or first paragraph)
    # Remove HTML tags to get plain text for title
    text_content = re.sub(r'<[^>]+>', '', html_content).strip()
    
    # Get first paragraph or heading text for title
    title_match = re.search(r'<h[1-6][^>]*>(.*?)</h[1-6]>', html_content, re.IGNORECASE)
    title_tag_to_remove = None
    
    if title_match:
        title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
        # Store the full title tag to remove it from content later
        title_tag_to_remove = title_match.group(0)
    else:
        # Try to get first paragraph
        para_match = re.search(r'<p[^>]*>(.*?)</p>', html_content, re.IGNORECASE)
        if para_match:
            title = re.sub(r'<[^>]+>', '', para_match.group(1)).strip()
            # Store the full paragraph tag to remove it from content later
            title_tag_to_remove = para_match.group(0)
        else:
            # Fallback to first 100 characters of text
            title = text_content[:100].split('\n')[0].strip()
    
    # If still no title, use filename
    if not title:
        title = file_path.stem
    
    # Limit title length
    if len(title) > 255:
        title = title[:252] + "..."
    
    # Remove title from HTML content if it was found
    if title_tag_to_remove:
        # Remove the title tag from HTML content
        html_content = html_content.replace(title_tag_to_remove, "", 1).strip()
        # Clean up any extra whitespace or empty paragraphs left behind
        html_content = re.sub(r'\n\s*\n\s*\n+', '\n\n', html_content)
        # Recalculate text_content after removing title
        text_content = re.sub(r'<[^>]+>', '', html_content).strip()

    # Images are embedded in HTML as Base64, no separate main image needed
    main_image = None

    # Generate description from first paragraph (first 200 chars of plain text)
    # Use content without title
    description = None
    if text_content:
        description = text_content[:200].strip()
        if len(text_content) > 200:
            description += "..."

    # Calculate reading time from plain text (without HTML tags and title)
    reading_time = calculate_reading_time(text_content)

    # No need to truncate HTML content - database field supports unlimited length
    # Base64 images can make content very large, which is expected

    return {
        "title": title,
        "content": html_content,
        "slug": slug,
        "description": description,
        "keywords": None,
        "image": main_image,
        "reading_time_minutes": reading_time,
        "image_paths": image_paths,
    }


def save_blog_post(
    session: Session, post_data: dict, dry_run: bool = False, force: bool = False
) -> Optional[BlogPost]:
    """Save blog post to database."""
    if dry_run:
        print(f"  [DRY RUN] Would create blog post: {post_data['title']}")
        return None

    # Check if post with this slug already exists
    existing_post = session.exec(
        select(BlogPost).where(BlogPost.slug == post_data["slug"])
    ).first()

    if existing_post:
        if force:
            # Update existing post
            existing_post.title = post_data["title"]
            existing_post.content = post_data["content"]
            existing_post.description = post_data["description"]
            existing_post.keywords = post_data["keywords"]
            existing_post.image = post_data["image"]
            existing_post.reading_time_minutes = post_data["reading_time_minutes"]
            existing_post.updated_at = datetime.now()
            session.add(existing_post)
            session.commit()
            session.refresh(existing_post)
            print(f"  ✓ Updated blog post: {existing_post.title} (ID: {existing_post.id})")
            if post_data["image_paths"]:
                print(f"    Images: {len(post_data['image_paths'])} file(s) (may already exist)")
            return existing_post
        else:
            # This shouldn't happen if we check before parsing, but just in case
            print(f"  ⚠ Post with slug '{post_data['slug']}' already exists, skipping...")
            return existing_post

    # Create new blog post
    blog_post = BlogPost(
        title=post_data["title"],
        content=post_data["content"],
        slug=post_data["slug"],
        description=post_data["description"],
        keywords=post_data["keywords"],
        image=post_data["image"],
        reading_time_minutes=post_data["reading_time_minutes"],
    )

    session.add(blog_post)
    session.commit()
    session.refresh(blog_post)

    print(f"  ✓ Created blog post: {blog_post.title} (ID: {blog_post.id})")
    if post_data["image_paths"]:
        print(f"    Images saved: {len(post_data['image_paths'])} file(s)")

    return blog_post


def main():
    """Main function to import docx files."""
    args = parse_args()

    # Determine data directory
    if args.data_dir:
        data_dir = Path(args.data_dir)
    else:
        data_dir = _backend_dir / "data"

    if not data_dir.exists():
        print(f"Error: Data directory does not exist: {data_dir}")
        sys.exit(1)

    print(f"Scanning directory: {data_dir}")

    # Find all .doc and .docx files
    doc_files = list(data_dir.glob("*.doc")) + list(data_dir.glob("*.docx"))
    doc_files = [f for f in doc_files if f.is_file()]

    if not doc_files:
        print("No .doc or .docx files found in data directory")
        sys.exit(0)

    # Separate .doc and .docx files
    old_doc_files = [f for f in doc_files if f.suffix.lower() == ".doc"]
    docx_files = [f for f in doc_files if f.suffix.lower() == ".docx"]
    
    if old_doc_files:
        print(f"⚠ Warning: Found {len(old_doc_files)} .doc file(s) which are not supported.")
        print("  Please convert them to .docx format first.")
        print(f"  Files: {', '.join(f.name for f in old_doc_files)}")
    
    if not docx_files:
        print("No .docx files found to process")
        sys.exit(0)

    print(f"Found {len(docx_files)} .docx file(s) to process")
    doc_files = docx_files  # Only process .docx files

    # Check if we need SSH tunnel
    # Same logic as in app/main.py, app/backend_pre_start.py, app/alembic/env.py
    # Skip SSH tunnel if --production flag is set (same as when ENVIRONMENT != "local")
    if args.production:
        needs_ssh_tunnel = False
        print("⚠ Production mode: Using direct database connection (no SSH tunnel)")
        print(f"   Connecting to: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
        print(f"   Environment: {settings.ENVIRONMENT}")
        if not args.dry_run:
            print("   ⚠ WARNING: This will write to production database!")
            response = input("   Continue? (yes/no): ")
            if response.lower() not in ("yes", "y"):
                print("   Aborted.")
                sys.exit(0)
    else:
        # In non-production mode, use SSH tunnel only if:
        # - Environment is local AND
        # - POSTGRES_SERVER is not localhost (meaning it's a remote server)
        # Same logic as in app/main.py, app/backend_pre_start.py, app/alembic/env.py
        needs_ssh_tunnel = (
            settings.ENVIRONMENT == "local"
            and settings.POSTGRES_SERVER not in ("localhost", "127.0.0.1")
        )

    def process_files(engine):
        """Process files with given database engine."""
        # Test connection before processing files
        try:
            from sqlalchemy import text
            test_conn = engine.connect()
            test_conn.close()
        except Exception as e:
            error_msg = str(e)
            # Check if it's a host resolution error
            if "failed to resolve host" in error_msg.lower() or "nodename nor servname provided" in error_msg.lower():
                # Extract hostname from engine URL
                engine_url = str(engine.url) if hasattr(engine, 'url') else str(engine)
                import re as re_module
                host_match = re_module.search(r'@([^:]+):', engine_url)
                hostname = host_match.group(1) if host_match else "unknown"
                
                print(f"\n✗ Error: Cannot resolve database host '{hostname}'")
                print(f"\n  This usually means:")
                if hostname in ("db", "postgres", "database"):
                    print(f"    - You're running the script locally, but '{hostname}' is a Docker container name")
                    print(f"    - Docker container names only work inside Docker networks")
                    print(f"\n  Trying to use SSH tunnel to connect to production database...")
                    # Use SSH tunnel from ssh_util.py (same as other parts of the app)
                    try:
                        with ssh_tunnel(local_port=5433):
                            print("  ✓ SSH tunnel active, connecting...")
                            # Modify URI to use SSH tunnel (same approach as app/main.py)
                            # Replace port first, then host (order matters to avoid partial matches)
                            tunnel_uri = str(settings.SQLALCHEMY_DATABASE_URI).replace(
                                f":{settings.POSTGRES_PORT}", ":5433"
                            ).replace(
                                f"@{settings.POSTGRES_SERVER}:", "@127.0.0.1:"
                            )
                            from sqlalchemy import create_engine
                            tunnel_engine = create_engine(tunnel_uri)
                            # Retry with tunnel
                            return process_files(tunnel_engine)
                    except Exception as tunnel_error:
                        print(f"  ✗ SSH tunnel failed: {tunnel_error}")
                        print(f"\n  Solutions:")
                        print(f"    1. Run the script inside Docker container:")
                        print(f"       docker compose exec backend uv run scripts/import_docx_blog_posts.py --production")
                        print(f"    2. Update POSTGRES_SERVER in .env file to 'localhost' for local development")
                        print(f"    3. Check SSH connection to production server")
                        sys.exit(1)
                else:
                    print(f"    - The host '{hostname}' is not accessible from your current location")
                    print(f"    - Check network connectivity and firewall settings")
                    print(f"    - Verify the hostname is correct")
                sys.exit(1)
            else:
                print(f"\n✗ Error: Failed to connect to database: {e}")
                print(f"\n  Please check:")
                print(f"    - Database server is running")
                print(f"    - Connection settings are correct")
                print(f"    - Network connectivity")
                sys.exit(1)
        
        with Session(engine) as session:
            # Verify connection and show database info
            try:
                from sqlalchemy import text
                # Check connection and count existing posts
                result = session.exec(text("SELECT COUNT(*) FROM blog_posts")).first()
                total_posts = result if result is not None else 0
                print(f"\n✓ Connected to database successfully")
                print(f"  Current blog posts in database: {total_posts}")
                
                # Show database name if possible
                db_name_result = session.exec(text("SELECT current_database()")).first()
                if db_name_result:
                    print(f"  Database name: {db_name_result}")
            except Exception as e:
                print(f"  ⚠ Warning: Could not verify database connection: {e}")
            
            for doc_file in doc_files:
                print(f"\nProcessing: {doc_file.name}")
                try:
                    # Generate slug from filename first (without parsing document)
                    slug = generate_slug(doc_file.name)
                    
                    # Check if post already exists (unless --force is used)
                    if not args.force:
                        existing = session.exec(
                            select(BlogPost).where(BlogPost.slug == slug)
                        ).first()
                        if existing:
                            print(f"  ⏭ Skipping (already exists): {slug} (ID: {existing.id})")
                            print(f"    Use --force to re-process this file")
                            continue

                    # Parse document (only if not skipping)
                    post_data = parse_docx_file(doc_file, data_dir)
                    
                    # Verify slug matches (should be the same, but double-check)
                    if post_data["slug"] != slug:
                        print(f"  ⚠ Warning: Generated slug mismatch, using: {post_data['slug']}")

                    # Save to database
                    save_blog_post(session, post_data, dry_run=args.dry_run, force=args.force)

                except Exception as e:
                    print(f"  ✗ Error processing {doc_file.name}: {e}")
                    import traceback
                    traceback.print_exc()
                    continue

    # Use same approach as app/main.py, app/backend_pre_start.py, app/alembic/env.py
    if needs_ssh_tunnel:
        print("Local environment with remote database detected, creating SSH tunnel...")
        with ssh_tunnel(local_port=5433):
            print("SSH tunnel active, processing files...")
            # Same tunnel URI modification as in app/main.py
            from sqlalchemy import create_engine
            tunnel_uri = str(settings.SQLALCHEMY_DATABASE_URI).replace(
                f":{settings.POSTGRES_PORT}", ":5433"
            ).replace(settings.POSTGRES_SERVER, "127.0.0.1")
            tunnel_engine = create_engine(tunnel_uri)
            process_files(tunnel_engine)
    else:
        # Use direct connection - same as app/core/db.py and other parts of the app
        print("Using direct database connection...")
        if not args.production:
            print(f"   Connecting to: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
            print(f"   Environment: {settings.ENVIRONMENT}")
        # Use engine from app.core.db (same as check_db.py and other scripts)
        from app.core.db import engine
        process_files(engine)

    print("\n✓ Import completed!")


if __name__ == "__main__":
    main()
