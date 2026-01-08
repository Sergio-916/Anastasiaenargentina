import logging

from sqlmodel import Session

from app.core.config import settings
from app.core.db import engine, init_db
from app.ssh_util import ssh_tunnel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    with Session(engine) as session:
        init_db(session)


def main() -> None:
    logger.info("Creating initial data")
    
    # Check if we need SSH tunnel (only if POSTGRES_SERVER is not localhost)
    needs_ssh_tunnel = (
        settings.ENVIRONMENT == "local" 
        and settings.POSTGRES_SERVER not in ("localhost", "127.0.0.1")
    )
    
    if needs_ssh_tunnel:
        logger.info("Local environment with remote database detected, creating SSH tunnel...")
        # Use port 5433 for SSH tunnel to avoid conflict with local PostgreSQL
        with ssh_tunnel(local_port=5433):
            logger.info("SSH tunnel active, creating initial data...")
            # Temporarily modify engine to use SSH tunnel port
            from sqlalchemy import create_engine
            tunnel_uri = str(settings.SQLALCHEMY_DATABASE_URI).replace(
                f":{settings.POSTGRES_PORT}", ":5433"
            ).replace(
                settings.POSTGRES_SERVER, "127.0.0.1"
            )
            tunnel_engine = create_engine(tunnel_uri)
            with Session(tunnel_engine) as session:
                init_db(session)
    else:
        logger.info("Using local database connection...")
        init()
    
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
