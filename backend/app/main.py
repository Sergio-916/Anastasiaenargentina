import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from starlette.formparsers import MultiPartParser
from starlette.requests import Request as StarletteRequest

from app.api.main import api_router
from app.core.config import settings
from app.admin import setup_admin


from contextlib import asynccontextmanager
from app.ssh_util import ssh_tunnel

# Increase max_part_size for multipart forms globally
# This allows larger content (e.g., HTML with Base64 images) in admin panel
# Default is 1024KB, we increase it to 50MB
# Store original form method
_original_form = StarletteRequest.form

async def _custom_form(self: StarletteRequest):
    """Custom form method with increased max_part_size."""
    # Only parse form data for POST/PUT/PATCH requests with Content-Type header
    if self.method not in ("POST", "PUT", "PATCH"):
        return await _original_form(self)
    
    # Check if Content-Type header exists
    content_type = self.headers.get("Content-Type", "")
    if not content_type or "multipart/form-data" not in content_type:
        return await _original_form(self)
    
    # Parse multipart form with increased size limit
    parser = MultiPartParser(
        headers=self.headers,
        stream=self.stream(),
        max_part_size=50 * 1024 * 1024  # 50MB instead of default 1MB
    )
    return await parser.parse()

# Monkey-patch Request.form to use increased limit
StarletteRequest.form = _custom_form

def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Check if we need SSH tunnel (only if POSTGRES_SERVER is not localhost)
    needs_ssh_tunnel = (
        settings.ENVIRONMENT == "local" 
        and settings.POSTGRES_SERVER not in ("localhost", "127.0.0.1")
    )
    
    if needs_ssh_tunnel:
        print("Starting SSH Tunnel for local development (using port 5433)...")
        # Use port 5433 for SSH tunnel to avoid conflict with local PostgreSQL
        with ssh_tunnel(local_port=5433):
            print("SSH Tunnel active.")
            # Modify database connection to use SSH tunnel
            from sqlalchemy import create_engine
            tunnel_uri = str(settings.SQLALCHEMY_DATABASE_URI).replace(
                f":{settings.POSTGRES_PORT}", ":5433"
            ).replace(
                settings.POSTGRES_SERVER, "127.0.0.1"
            )
            # Update the global engine to use tunnel
            from app.core import db
            db.engine = create_engine(tunnel_uri)
            yield
            print("SSH Tunnel closing...")
    else:
        print("Using local database connection (no SSH tunnel needed).")
        yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Setup admin panel
setup_admin(app, secret_key=settings.SECRET_KEY)
