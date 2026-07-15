import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class OAuthAccount(SQLModel, table=True):
    __tablename__ = "oauth_accounts"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        sa_column=sa.Column(
            sa.UUID,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    provider: str = Field(max_length=50)
    provider_user_id: str = Field(max_length=255)
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None

    __table_args__ = (
        sa.Index(
            "ix_oauth_accounts_provider_provider_user_id",
            "provider",
            "provider_user_id",
            unique=True,
        ),
    )
