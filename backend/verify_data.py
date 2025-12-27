
import sys
import os
import psycopg

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ssh_util import ssh_tunnel

# Configuration
DB_HOST = "127.0.0.1"
DB_PORT = "5432"
DB_USER = "app_user"
DB_PASS = "Savanaanastasiasitepostgres12"
DB_NAME = "anastasia_db"

def main():
    print(f"Connecting to database at {DB_HOST}:{DB_PORT}...")
    try:
        with ssh_tunnel():
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

    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == "__main__":
    main()
