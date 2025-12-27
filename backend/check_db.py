
import sys
import logging
from sqlalchemy import text
from app.core.db import engine
from app.ssh_util import ssh_tunnel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_connection():
    logger.info("Attempting to connect to PostgreSQL using app.core.db.engine...")
    try:
        with ssh_tunnel():
            # Connect using the sqlalchemy engine
            # engine.connect() creates a connection
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
