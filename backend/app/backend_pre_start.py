import logging

from sqlalchemy import Engine
from sqlmodel import Session, select
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed

from app.core.config import settings
from app.core.db import engine
from app.ssh_util import ssh_tunnel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def init(db_engine: Engine) -> None:
    try:
        with Session(db_engine) as session:
            # Try to create session to check if DB is awake
            session.exec(select(1))
    except Exception as e:
        logger.error(e)
        raise e


def main() -> None:
    logger.info("Initializing service")
    
    # Check if we need SSH tunnel (only if POSTGRES_SERVER is not localhost)
    needs_ssh_tunnel = (
        settings.ENVIRONMENT == "local" 
        and settings.POSTGRES_SERVER not in ("localhost", "127.0.0.1")
    )
    
    if needs_ssh_tunnel:
        logger.info("Local environment with remote database detected, creating SSH tunnel...")
        # Use port 5433 for SSH tunnel to avoid conflict with local PostgreSQL
        with ssh_tunnel(local_port=5433):
            logger.info("SSH tunnel active, checking database connection...")
            # Temporarily modify engine to use SSH tunnel port
            from sqlalchemy import create_engine
            tunnel_uri = str(settings.SQLALCHEMY_DATABASE_URI).replace(
                f":{settings.POSTGRES_PORT}", ":5433"
            ).replace(
                settings.POSTGRES_SERVER, "127.0.0.1"
            )
            tunnel_engine = create_engine(tunnel_uri)
            init(tunnel_engine)
        # Small delay to ensure SSH tunnel is fully closed
        import time
        time.sleep(1)
    else:
        logger.info("Using local database connection...")
        init(engine)
    
    logger.info("Service finished initializing")


if __name__ == "__main__":
    main()
