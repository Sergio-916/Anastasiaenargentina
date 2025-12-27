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
    
    # In local environment, create SSH tunnel before connecting to DB
    if settings.ENVIRONMENT == "local":
        logger.info("Local environment detected, creating SSH tunnel...")
        with ssh_tunnel():
            logger.info("SSH tunnel active, creating initial data...")
            init()
    else:
        init()
    
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
