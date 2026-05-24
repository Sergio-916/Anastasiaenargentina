import secrets
import warnings
from typing import Annotated, Any, Literal
from urllib.parse import unquote, urlparse

from pydantic import (
    AnyUrl,
    BeforeValidator,
    EmailStr,
    HttpUrl,
    PostgresDsn,
    computed_field,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",") if i.strip()]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Use top level .env file (one level above ./backend/)
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "changethis"
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    FRONTEND_HOST: str = "http://localhost:3000"
    BACKEND_HOST: str = "http://localhost:8000"
    # Public URL for OAuth (used in production when API is proxied via frontend)
    NEXT_PUBLIC_BACKEND_URL: str = ""
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []



    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    PROJECT_NAME: str
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    # Optional single URL in .env; fills discrete POSTGRES_* only where those are empty
    POSTGRES_URL: str | None = None

    @model_validator(mode="before")
    @classmethod
    def _merge_postgres_url(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        merged = dict(data)
        url = merged.get("POSTGRES_URL")
        if not isinstance(url, str) or not url.strip():
            return merged
        parsed = urlparse(url)
        if not parsed.hostname:
            return merged
        scheme = parsed.scheme
        if scheme not in ("postgresql", "postgres") and not scheme.startswith(
            "postgresql+"
        ):
            return merged

        def fill_if_empty(key: str, value: Any) -> None:
            current = merged.get(key)
            if current is None or current == "":
                merged[key] = value

        fill_if_empty("POSTGRES_USER", unquote(parsed.username or ""))
        fill_if_empty("POSTGRES_PASSWORD", unquote(parsed.password or ""))
        fill_if_empty("POSTGRES_SERVER", parsed.hostname)
        fill_if_empty("POSTGRES_PORT", parsed.port or 5432)
        dbname = (parsed.path or "").lstrip("/").split("?")[0]
        if dbname:
            fill_if_empty("POSTGRES_DB", dbname)
        return merged

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAILS_FROM_NAME: str | None = None

    @model_validator(mode="after")
    def _set_default_emails_from(self) -> Self:
        if not self.EMAILS_FROM_NAME:
            self.EMAILS_FROM_NAME = self.PROJECT_NAME
        return self

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48

    @computed_field  # type: ignore[prop-decorator]
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.EMAILS_FROM_EMAIL)

    EMAIL_TEST_USER: EmailStr = "test@example.com"
    FIRST_SUPERUSER: EmailStr = "sergey.shpak79@gmail.com"
    FIRST_SUPERUSER_PASSWORD: str = "Savana12"

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        if value == "changethis":
            message = (
                f'The value of {var_name} is "changethis", '
                "for security, please change it, at least for deployments."
            )
            if self.ENVIRONMENT == "local":
                warnings.warn(message, stacklevel=1)
            else:
                raise ValueError(message)

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        self._check_default_secret("SECRET_KEY", self.SECRET_KEY)
        self._check_default_secret("POSTGRES_PASSWORD", self.POSTGRES_PASSWORD)
        self._check_default_secret(
            "FIRST_SUPERUSER_PASSWORD", self.FIRST_SUPERUSER_PASSWORD
        )

        return self
    # feature flag registration
    feature_registration_enabled: bool = False
    FEATURE_SHOW_EVENTS: bool = False


settings = Settings()  # type: ignore
