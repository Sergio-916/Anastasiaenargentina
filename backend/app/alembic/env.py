import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
# target_metadata = None

import app.models  # noqa: F401  (важно: просто импортнуть пакет)
# Explicitly import all table models to ensure they're registered in metadata
from app.models import (
    AdminUser,
    Contact,
    Tour,
    TourDate,
    BlogPost,
    SiteUser,
    User,
    Item,
)  # noqa: F401
from sqlmodel import SQLModel
from app.core.config import settings # noqa
from app.ssh_util import ssh_tunnel  # noqa

target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def get_url():
    return str(settings.SQLALCHEMY_DATABASE_URI)


def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url, target_metadata=target_metadata, literal_binds=True, compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section)
    
    # Check if we need SSH tunnel (only if POSTGRES_SERVER is not localhost)
    needs_ssh_tunnel = (
        settings.ENVIRONMENT == "local" 
        and settings.POSTGRES_SERVER not in ("localhost", "127.0.0.1")
    )
    
    if needs_ssh_tunnel:
        # Use SSH tunnel on port 5433 to avoid conflict with local PostgreSQL
        db_url = str(settings.SQLALCHEMY_DATABASE_URI).replace(
            f":{settings.POSTGRES_PORT}", ":5433"
        ).replace(
            settings.POSTGRES_SERVER, "127.0.0.1"
        )
    else:
        db_url = get_url()
    
    configuration["sqlalchemy.url"] = db_url
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    # In local environment with remote DB, create SSH tunnel before connecting to DB
    if needs_ssh_tunnel:
        with ssh_tunnel(local_port=5433):
            with connectable.connect() as connection:
                context.configure(
                    connection=connection, target_metadata=target_metadata, compare_type=True
                )

                with context.begin_transaction():
                    context.run_migrations()
    else:
        with connectable.connect() as connection:
            context.configure(
                connection=connection, target_metadata=target_metadata, compare_type=True
            )

            with context.begin_transaction():
                context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
