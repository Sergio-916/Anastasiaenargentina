"""
OAuth 2.0 routes for Google and other providers.
"""
from datetime import timedelta
from urllib.parse import urlencode

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse

from app import crud
from app.core import security
from app.core.config import settings
from app.core.db import engine
from sqlmodel import Session

router = APIRouter(tags=["oauth"])

# OAuth client - initialized lazily when Google is configured
_oauth = None


def get_oauth():
    """Get or create OAuth instance with Google provider."""
    global _oauth
    if _oauth is None:
        from authlib.integrations.starlette_client import OAuth

        _oauth = OAuth()
        if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
            _oauth.register(
                name="google",
                server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                client_kwargs={"scope": "openid email profile"},
            )
    return _oauth


@router.get("/login/google")
async def login_google(request: Request):
    """
    Redirect user to Google OAuth consent screen.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=501,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )

    oauth = get_oauth()
    # Use NEXT_PUBLIC_BACKEND_URL in production when API is proxied via frontend
    base_url = (
        settings.NEXT_PUBLIC_BACKEND_URL
        if settings.ENVIRONMENT != "local" and settings.NEXT_PUBLIC_BACKEND_URL
        else settings.BACKEND_HOST
    )
    redirect_uri = f"{base_url.rstrip('/')}{settings.API_V1_STR}/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/google/callback")
async def auth_google_callback(request: Request):
    """
    Handle Google OAuth callback. Exchange code for token, get user info,
    create or update user, and redirect to frontend with JWT.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="Google OAuth is not configured.")

    oauth = get_oauth()
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}") from e

    userinfo = token.get("userinfo")
    if not userinfo:
        raise HTTPException(status_code=400, detail="Failed to get user info from Google.")

    email = userinfo.get("email")
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Google did not provide email. Ensure email scope is granted.",
        )

    full_name = userinfo.get("name")
    image = userinfo.get("picture")
    provider_user_id = userinfo.get("sub", "")
    access_token = token.get("access_token")
    refresh_token = token.get("refresh_token")
    expires_at = None
    if token.get("expires_at"):
        from datetime import datetime

        expires_at = datetime.fromtimestamp(token["expires_at"])

    with Session(engine) as session:
        user = crud.get_or_create_user_from_google(
            session=session,
            email=email,
            full_name=full_name,
            image=image,
            provider_user_id=provider_user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
        )

        if not user.is_active:
            raise HTTPException(status_code=400, detail="User account is inactive.")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )

    # Redirect to frontend with token (frontend will store and remove from URL)
    # Use NEXT_PUBLIC_BACKEND_URL in production when same domain
    frontend_base = (
        settings.NEXT_PUBLIC_BACKEND_URL
        if settings.ENVIRONMENT != "local" and settings.NEXT_PUBLIC_BACKEND_URL
        else settings.FRONTEND_HOST
    )
    frontend_callback = f"{frontend_base.rstrip('/')}/auth/callback"
    redirect_url = f"{frontend_callback}?{urlencode({'token': jwt_token})}"
    return RedirectResponse(url=redirect_url, status_code=302)
