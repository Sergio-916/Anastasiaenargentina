
import sys
import logging
from sqlalchemy import text
from app.core.db import engine
from app.core.config import settings
from app.ssh_util import ssh_tunnel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_connection():
    logger.info("Attempting to connect to PostgreSQL using app.core.db.engine...")
    try:
        # In local environment, create SSH tunnel before connecting to DB
        if settings.ENVIRONMENT == "local":
            logger.info("Local environment detected, creating SSH tunnel...")
            with ssh_tunnel():
                logger.info("SSH tunnel active, checking database connection...")
                with engine.connect() as conn:
                    result = conn.execute(text("SELECT 1"))
                    logger.info(f"Query Result: {result.scalar()}")
                    logger.info("SUCCESS: Connection established!")
                    sys.exit(0)
        else:
            # In production/staging, connect directly without tunnel
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                logger.info(f"Query Result: {result.scalar()}")
                logger.info("SUCCESS: Connection established!")
                sys.exit(0)
    except Exception as e:
        logger.error(f"FAILURE: Could not connect to database.\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    check_connection()
