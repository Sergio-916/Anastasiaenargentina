#!/usr/bin/env python3
"""
Import .docx files as blog posts: Markdown body + WebP images on disk under data/blog_media/{slug}/.

Image URLs in markdown use /blog-media/{slug}/... (served by FastAPI StaticFiles).
With --production, image files are uploaded to VPS via SFTP into backend/data/blog_media.

Usage:
    python scripts/import_docx_blog_posts_markdown.py [--force] [--dry-run] [--production] [--data-dir PATH]

Same database connection behavior as import_docx_blog_posts.py (SSH tunnel in local + remote host).
"""
from __future__ import annotations

import argparse
import io
import os
import posixpath
import re
import sys
import uuid
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

import mammoth
import paramiko
from mammoth.images import img_element
from PIL import Image
from sqlmodel import Session, select

# Match StaticFiles mount path in app/main.py
BLOG_MEDIA_URL_PREFIX = "/blog-media"

# Optional downscale for large raster images (same idea as legacy HTML importer)
MAX_IMAGE_PIXELS = 1200
WEBP_QUALITY = 75

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
    # Align with import_docx_blog_posts.py:
    # in production mode prefer POSTGRES_URL from top-level .env and
    # override discrete POSTGRES_* values to avoid accidental localhost usage.
    from dotenv import load_dotenv

    env_file_path = _backend_dir.parent / ".env"
    if env_file_path.exists():
        load_dotenv(env_file_path)

    postgres_url = os.getenv("POSTGRES_URL")
    if postgres_url:
        match = re.match(r"postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", postgres_url)
        if match:
            user, password, host, port, dbname = match.groups()
            os.environ["POSTGRES_USER"] = user
            os.environ["POSTGRES_PASSWORD"] = password
            os.environ["POSTGRES_SERVER"] = host
            os.environ["POSTGRES_PORT"] = port
            os.environ["POSTGRES_DB"] = dbname

from app.core.config import settings
from app.models import BlogPost
from app.ssh_util import ssh_tunnel
from app.translit import transliterate

SSH_HOST = "31.97.174.27"
SSH_PORT = 22
SSH_USER = "devuser"
SSH_KEY_PATH = "/Users/sergey.shpak79gmail.com/.ssh/vps_31_ed25519"
VPS_BLOG_MEDIA_ROOT = (
    "/home/devuser/projects/Anastasiaenargentina/backend/data/blog_media"
)


def load_private_key(path: str):
    loaders = [
        paramiko.Ed25519Key.from_private_key_file,
        paramiko.RSAKey.from_private_key_file,
        paramiko.ECDSAKey.from_private_key_file,
    ]
    last_error = None
    for loader in loaders:
        try:
            return loader(path)
        except Exception as e:
            last_error = e
    raise RuntimeError(f"Could not load SSH key: {last_error}")


def sftp_mkdir_p(sftp: paramiko.SFTPClient, remote_directory: str) -> None:
    parts = remote_directory.strip("/").split("/")
    current = ""
    for part in parts:
        current = f"{current}/{part}"
        try:
            sftp.stat(current)
        except FileNotFoundError:
            sftp.mkdir(current)


@contextmanager
def create_vps_sftp_client():
    transport = paramiko.Transport((SSH_HOST, SSH_PORT))
    try:
        pkey = load_private_key(SSH_KEY_PATH)
        transport.connect(username=SSH_USER, pkey=pkey)
        sftp = paramiko.SFTPClient.from_transport(transport)
        try:
            yield sftp
        finally:
            sftp.close()
    finally:
        transport.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import .docx files as Markdown blog posts with images on disk"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-process files even if a post with the same slug exists",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse files but do not write to the database",
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default=None,
        help="Data directory (default: backend/data)",
    )
    parser.add_argument(
        "--production",
        action="store_true",
        help="Production DB connection (no SSH tunnel)",
    )
    return parser.parse_args()


def generate_slug(filename: str) -> str:
    name = Path(filename).stem
    name = transliterate(name)
    name = name.lower()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[-\s]+", "-", name)
    return name.strip("-")


def calculate_reading_time(content: str) -> int:
    word_count = len(content.split())
    return max(1, round(word_count / 200))


def _clean_docx_markdown(markdown: str) -> str:
    """
    Fix common Word/mammoth artifacts: empty bookmark anchors, broken __ emphasis,
    and escaped punctuation (\\-, \\.).
    """
    text = markdown
    # Empty <a></a> from Word (OLE_LINK, bookmarks) — no visible text
    text = re.sub(r"<a\b[^>]*>\s*</a>\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<span\b[^>]*>\s*</span>\s*", "", text, flags=re.IGNORECASE)
    # Optional hyphens / escaped dots mammoth keeps as backslash sequences
    text = re.sub(r"\\([.\-–—])", r"\1", text)
    # Word "underline" → __...__ ; trailing space before closing __ breaks CommonMark
    def _underscore_emphasis(m: re.Match[str]) -> str:
        inner = m.group(1).strip()
        if not inner:
            return m.group(0)
        return f"**{inner}**"

    text = re.sub(
        r"__\s*((?:[^_]|_(?!_))+?)\s*__",
        _underscore_emphasis,
        text,
    )
    return text


def _separate_glued_markdown_images(markdown: str) -> str:
    """
    Mammoth often puts the first image on the same line as the title with no space:
    'Some title 🏖️![](/blog-media/...webp)'. Many Markdown parsers mis-handle that.
    Split so the image starts its own block (blank line before ![]).
    """
    out: list[str] = []
    for line in markdown.splitlines():
        # Only when ![ is glued to previous non-whitespace (not already " ![")
        patched = re.sub(r"(\S)(!\[)", r"\1\n\n\2", line)
        if "\n" in patched:
            out.extend(patched.splitlines())
        else:
            out.append(patched)
    return "\n".join(out)


def _normalize_markdown_image_syntax(markdown: str) -> str:
    """
    Word / Copilot often put a long, multi-line image description in the alt text.
    Markdown requires ![alt](url) with no raw newlines inside [...]; otherwise parsers
    (e.g. react-markdown) do not treat it as an image and the link breaks.
    """
    parts: list[str] = []
    i = 0
    n = len(markdown)
    while i < n:
        start = markdown.find("![", i)
        if start == -1:
            parts.append(markdown[i:])
            break
        parts.append(markdown[i:start])
        close_alt = markdown.find("](", start + 2)
        if close_alt == -1:
            parts.append(markdown[start : start + 2])
            i = start + 2
            continue
        close_url = markdown.find(")", close_alt + 2)
        if close_url == -1:
            parts.append(markdown[start : close_alt + 2])
            i = close_alt + 2
            continue
        alt = markdown[start + 2 : close_alt]
        url = markdown[close_alt + 2 : close_url]
        alt_one_line = re.sub(r"\s+", " ", alt.strip())
        if len(alt_one_line) > 500:
            alt_one_line = alt_one_line[:497] + "..."
        parts.append(f"![{alt_one_line}]({url})")
        i = close_url + 1
    return "".join(parts)


def _plain_title_for_db(raw: str) -> str:
    """Strip HTML/markdown noise for BlogPost.title (plain text)."""
    s = raw.strip()
    # Title line may still contain ![](url) if mammoth glued it (defensive)
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)\s*", "", s)
    s = re.sub(r"<a\b[^>]*>\s*</a>\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"<[^>]+>", "", s)
    s = re.sub(r"^#\s+", "", s)
    s = re.sub(r"\\([.\-–—])", r"\1", s)
    while True:
        prev = s
        t = s.strip()
        t = re.sub(r"^\s*__\s*(.+?)\s*__\s*$", r"\1", t)
        t = re.sub(r"^\s*\*\*\s*(.+?)\s*\*\*\s*$", r"\1", t)
        s = t.strip()
        if s == prev:
            break
    return re.sub(r"\s+", " ", s).strip()


def _markdown_plain_preview(md: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", md)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"[*_`]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _prepare_image_for_webp(image_bytes: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode not in ("RGB", "RGBA"):
        if img.mode == "P" and "transparency" in img.info:
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")
    w, h = img.size
    if max(w, h) > MAX_IMAGE_PIXELS:
        img.thumbnail((MAX_IMAGE_PIXELS, MAX_IMAGE_PIXELS), Image.Resampling.LANCZOS)
    return img


def make_convert_image(
    slug: str,
    post_images_dir: Optional[Path],
    first_public_url: list[str],
    remote_sftp=None,
    write_images: bool = True,
):
    remote_post_dir = posixpath.join(VPS_BLOG_MEDIA_ROOT, slug) if remote_sftp else None
    if write_images:
        if remote_sftp is not None:
            sftp_mkdir_p(remote_sftp, remote_post_dir)
        elif post_images_dir is not None:
            post_images_dir.mkdir(parents=True, exist_ok=True)

    @img_element
    def convert_image(image) -> dict:
        def save_bytes(filename: str, payload: bytes) -> None:
            if not write_images:
                return
            if remote_sftp is not None:
                remote_path = posixpath.join(remote_post_dir, filename)
                with remote_sftp.file(remote_path, "wb") as remote_file:
                    remote_file.write(payload)
                    remote_file.flush()
                return
            if post_images_dir is None:
                raise RuntimeError("Local image directory is not configured")
            (post_images_dir / filename).write_bytes(payload)

        with image.open() as f:
            raw = f.read()
        try:
            img = _prepare_image_for_webp(raw)
        except OSError:
            filename = f"{uuid.uuid4().hex}.bin"
            save_bytes(filename, raw)
            public_path = f"{BLOG_MEDIA_URL_PREFIX}/{slug}/{filename}"
            if not first_public_url:
                first_public_url.append(public_path)
            return {"src": public_path}

        filename = f"{uuid.uuid4().hex}.webp"
        out = io.BytesIO()
        img.save(out, format="WEBP", quality=WEBP_QUALITY)
        save_bytes(filename, out.getvalue())
        public_path = f"{BLOG_MEDIA_URL_PREFIX}/{slug}/{filename}"
        if not first_public_url:
            first_public_url.append(public_path)
        return {"src": public_path}

    return convert_image  # already wrapped by @img_element


def parse_docx_to_markdown(
    file_path: Path,
    slug: str,
    data_dir: Path,
    remote_sftp=None,
    write_images: bool = True,
) -> tuple[str, Optional[str]]:
    if file_path.suffix.lower() == ".doc":
        raise ValueError(
            "Old .doc format is not supported. Convert the file to .docx first."
        )

    blog_media_root = data_dir / "blog_media"
    post_dir = None if remote_sftp else (blog_media_root / slug)
    first_url: list[str] = []
    convert_image_fn = make_convert_image(
        slug=slug,
        post_images_dir=post_dir,
        first_public_url=first_url,
        remote_sftp=remote_sftp,
        write_images=write_images,
    )

    with open(file_path, "rb") as docx_file:
        result = mammoth.convert_to_markdown(
            docx_file,
            convert_image=convert_image_fn,
        )
    markdown = result.value
    for message in result.messages:
        if message.type == "warning":
            print(f"    Warning: {message.message}")

    markdown = _clean_docx_markdown(markdown)
    markdown = _separate_glued_markdown_images(markdown)
    markdown = _normalize_markdown_image_syntax(markdown)
    cover = first_url[0] if first_url else None
    return markdown, cover


def parse_docx_file(
    file_path: Path,
    data_dir: Path,
    remote_sftp=None,
    write_images: bool = True,
) -> dict:
    slug = generate_slug(file_path.name)
    try:
        markdown, cover_image_url = parse_docx_to_markdown(
            file_path,
            slug,
            data_dir,
            remote_sftp=remote_sftp,
            write_images=write_images,
        )
    except Exception as e:
        raise ValueError(f"Failed to convert document to Markdown: {e}") from e

    if not markdown.strip():
        raise ValueError("Document is empty")

    lines = markdown.splitlines()
    title = ""
    title_line_to_remove: Optional[str] = None

    for line in lines:
        heading = re.match(r"^#\s+(.+)$", line)
        if heading:
            title = heading.group(1).strip()
            title_line_to_remove = line
            break
    if not title:
        for line in lines:
            stripped = line.strip()
            if stripped:
                title = stripped
                title_line_to_remove = line
                break

    if not title:
        title = file_path.stem
    title = _plain_title_for_db(title)
    if not title:
        title = _plain_title_for_db(file_path.stem)
    if len(title) > 255:
        title = title[:252] + "..."

    if title_line_to_remove is not None:
        new_lines = [ln for ln in lines if ln != title_line_to_remove]
        markdown = "\n".join(new_lines).strip()

    plain = _markdown_plain_preview(markdown)
    description = None
    if plain:
        description = plain[:200].strip()
        if len(plain) > 200:
            description += "..."

    reading_time = calculate_reading_time(plain)

    return {
        "title": title,
        "content_markdown": markdown,
        "slug": slug,
        "description": description,
        "keywords": None,
        "cover_image_url": cover_image_url,
        "reading_time_minutes": reading_time,
    }


def save_blog_post(
    session: Session, post_data: dict, dry_run: bool = False, force: bool = False
) -> Optional[BlogPost]:
    if dry_run:
        print(f"  [DRY RUN] Would create blog post: {post_data['title']}")
        return None

    existing_post = session.exec(
        select(BlogPost).where(BlogPost.slug == post_data["slug"])
    ).first()

    if existing_post:
        if force:
            existing_post.title = post_data["title"]
            existing_post.content_markdown = post_data["content_markdown"]
            existing_post.description = post_data["description"]
            existing_post.keywords = post_data["keywords"]
            existing_post.cover_image_url = post_data["cover_image_url"]
            existing_post.reading_time_minutes = post_data["reading_time_minutes"]
            existing_post.updated_at = datetime.now()
            session.add(existing_post)
            session.commit()
            session.refresh(existing_post)
            print(f"  ✓ Updated blog post: {existing_post.title} (ID: {existing_post.id})")
            return existing_post
        print(f"  ⚠ Post with slug '{post_data['slug']}' already exists, skipping...")
        return existing_post

    blog_post = BlogPost(
        title=post_data["title"],
        content_markdown=post_data["content_markdown"],
        slug=post_data["slug"],
        description=post_data["description"],
        keywords=post_data["keywords"],
        cover_image_url=post_data["cover_image_url"],
        reading_time_minutes=post_data["reading_time_minutes"],
    )
    session.add(blog_post)
    session.commit()
    session.refresh(blog_post)
    print(f"  ✓ Created blog post: {blog_post.title} (ID: {blog_post.id})")
    return blog_post


def main():
    args = parse_args()
    if args.data_dir:
        data_dir = Path(args.data_dir)
    else:
        data_dir = _backend_dir / "data"

    if not data_dir.exists():
        print(f"Error: Data directory does not exist: {data_dir}")
        sys.exit(1)

    print(f"Scanning directory: {data_dir}")
    doc_files = list(data_dir.glob("*.doc")) + list(data_dir.glob("*.docx"))
    doc_files = [f for f in doc_files if f.is_file()]

    old_doc = [f for f in doc_files if f.suffix.lower() == ".doc"]
    docx_files = [f for f in doc_files if f.suffix.lower() == ".docx"]

    if old_doc:
        print(
            f"⚠ Warning: Found {len(old_doc)} .doc file(s) which are not supported. "
            "Convert them to .docx first."
        )
    if not docx_files:
        print("No .docx files found to process")
        sys.exit(0)

    print(f"Found {len(docx_files)} .docx file(s) to process")

    if args.production:
        needs_ssh_tunnel = False
        print("⚠ Production mode: Using direct database connection (no SSH tunnel)")
        print(
            f"   Connecting to: {settings.POSTGRES_SERVER}:"
            f"{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
        )
        print(f"   Environment: {settings.ENVIRONMENT}")
        if not args.dry_run:
            print("   ⚠ WARNING: This will write to production database!")
            response = input("   Continue? (yes/no): ")
            if response.lower() not in ("yes", "y"):
                print("   Aborted.")
                sys.exit(0)
    else:
        needs_ssh_tunnel = (
            settings.ENVIRONMENT == "local"
            and settings.POSTGRES_SERVER not in ("localhost", "127.0.0.1")
        )

    def process_files(engine, remote_sftp=None, write_images: bool = True):
        try:
            test_conn = engine.connect()
            test_conn.close()
        except Exception as e:
            error_msg = str(e)
            if (
                "failed to resolve host" in error_msg.lower()
                or "nodename nor servname provided" in error_msg.lower()
            ):
                engine_url = str(engine.url) if hasattr(engine, "url") else str(engine)
                import re as re_module

                host_match = re_module.search(r"@([^:]+):", engine_url)
                hostname = host_match.group(1) if host_match else "unknown"
                print(f"\n✗ Error: Cannot resolve database host '{hostname}'")
                if hostname in ("db", "postgres", "database"):
                    print("\n  Trying SSH tunnel...")
                    try:
                        with ssh_tunnel(local_port=5433):
                            print("  ✓ SSH tunnel active, connecting...")
                            tunnel_uri = str(settings.SQLALCHEMY_DATABASE_URI).replace(
                                f":{settings.POSTGRES_PORT}", ":5433"
                            ).replace(f"@{settings.POSTGRES_SERVER}:", "@127.0.0.1:")
                            from sqlalchemy import create_engine

                            tunnel_engine = create_engine(tunnel_uri)
                            return process_files(
                                tunnel_engine,
                                remote_sftp=remote_sftp,
                                write_images=write_images,
                            )
                    except Exception as tunnel_error:
                        print(f"  ✗ SSH tunnel failed: {tunnel_error}")
                        sys.exit(1)
                else:
                    sys.exit(1)
            else:
                print(f"\n✗ Error: Failed to connect to database: {e}")
                sys.exit(1)

        with Session(engine) as session:
            try:
                from sqlalchemy import text

                total_posts = session.exec(
                    text("SELECT COUNT(*) FROM blog_posts")
                ).first()
                print(f"\n✓ Connected. Blog posts in database: {total_posts}")
                db_name_result = session.exec(text("SELECT current_database()")).first()
                if db_name_result:
                    print(f"  Database name: {db_name_result}")
            except Exception as e:
                print(f"  ⚠ Warning: Could not verify connection: {e}")

            for doc_file in docx_files:
                print(f"\nProcessing: {doc_file.name}")
                try:
                    slug = generate_slug(doc_file.name)
                    if not args.force:
                        existing = session.exec(
                            select(BlogPost).where(BlogPost.slug == slug)
                        ).first()
                        if existing:
                            print(
                                f"  ⏭ Skipping (already exists): {slug} (ID: {existing.id})"
                            )
                            print("    Use --force to re-process")
                            continue

                    post_data = parse_docx_file(
                        doc_file,
                        data_dir,
                        remote_sftp=remote_sftp,
                        write_images=write_images,
                    )
                    if post_data["slug"] != slug:
                        print(f"  ⚠ Slug mismatch, using: {post_data['slug']}")

                    save_blog_post(
                        session, post_data, dry_run=args.dry_run, force=args.force
                    )
                except Exception as e:
                    print(f"  ✗ Error processing {doc_file.name}: {e}")
                    import traceback

                    traceback.print_exc()
                    continue

    if needs_ssh_tunnel:
        print("Local environment with remote database, creating SSH tunnel...")
        with ssh_tunnel(local_port=5433):
            from sqlalchemy import create_engine

            tunnel_uri = str(settings.SQLALCHEMY_DATABASE_URI).replace(
                f":{settings.POSTGRES_PORT}", ":5433"
            ).replace(settings.POSTGRES_SERVER, "127.0.0.1")
            tunnel_engine = create_engine(tunnel_uri)
            process_files(tunnel_engine, write_images=not args.dry_run)
    else:
        print("Using direct database connection...")
        if not args.production:
            print(
                f"   Connecting to: {settings.POSTGRES_SERVER}:"
                f"{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
            )
            print(f"   Environment: {settings.ENVIRONMENT}")
        from app.core.db import engine

        if args.production and not args.dry_run:
            print(f"   Media upload target (VPS): {VPS_BLOG_MEDIA_ROOT}")
            try:
                with create_vps_sftp_client() as remote_sftp:
                    print("   ✓ SFTP connected")
                    process_files(
                        engine,
                        remote_sftp=remote_sftp,
                        write_images=True,
                    )
            except Exception as e:
                print(f"✗ Failed to initialize SFTP upload for images: {e}")
                sys.exit(1)
        else:
            if args.production and args.dry_run:
                print("   Dry-run mode: image upload to VPS is disabled")
            process_files(engine, write_images=not args.dry_run)

    print("\n✓ Import completed!")


if __name__ == "__main__":
    main()
