
import sys
import os
import psycopg

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ssh_util import ssh_tunnel
from app.core.config import settings

# Configuration
DB_HOST = "127.0.0.1"
DB_PORT = "5432"
DB_USER = "app_user"
DB_PASS = "Savanaanastasiasitepostgres12"
DB_NAME = "anastasia_db"

def main():
    print(f"Connecting to database at {DB_HOST}:{DB_PORT}...")
    try:
        # In local environment, create SSH tunnel before connecting to DB
        if settings.ENVIRONMENT == "local":
            print("Local environment detected, creating SSH tunnel...")
            with ssh_tunnel():
                print("SSH tunnel active, verifying data...")
                _verify_data()
        else:
            # In production/staging, connect directly without tunnel
            print(f"Connecting directly (environment: {settings.ENVIRONMENT})...")
            _verify_data()

    except Exception as e:
        print(f"FAILURE: {e}")

def _verify_data():
    """Helper function to verify data"""
    conn = psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME,
        connect_timeout=10
    )
    
    with conn.cursor() as cur:
        print("Checking table counts:")
        tables = ["admin_users", "contacts", "tours", "tour_date", "users"]
        for table in tables:
            try:
                cur.execute(f'SELECT count(*) FROM "{table}"')
                count = cur.fetchone()[0]
                print(f"  {table}: {count} rows")
            except Exception as e:
                print(f"  {table}: Error querying ({e})")
    
    conn.close()

if __name__ == "__main__":
    main()
