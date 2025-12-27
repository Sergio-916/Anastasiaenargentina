
import sys
import os
import re
import psycopg
from psycopg import OperationalError

# Add project root to sys.path to find app module
# Assuming this script is in backend/
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ssh_util import ssh_tunnel

# Configuration
DB_HOST = "127.0.0.1"
DB_PORT = "5432"
DB_USER = "app_user"
DB_PASS = "Savanaanastasiasitepostgres12"
DB_NAME = "anastasia_db"

SQL_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app/data/u318670773_sitedb.sql")

# DDL Statements for PostgreSQL
DDL_STATEMENTS = {
    "admin_users": """
        CREATE TABLE admin_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """,
    "contacts": """
        CREATE TABLE contacts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """,
    "tours": """
        CREATE TABLE tours (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            duration INTEGER NOT NULL,
            cost VARCHAR(50) NOT NULL,
            additional_cost VARCHAR(50) NOT NULL,
            meeting_point VARCHAR(255) NOT NULL,
            description VARCHAR(1000) NOT NULL,
            additional_description VARCHAR(1000) NOT NULL,
            max_capacity INTEGER,
            slug VARCHAR(255) NOT NULL UNIQUE
        );
    """,
    "tour_date": """
        CREATE TABLE tour_date (
            id SERIAL PRIMARY KEY,
            tour_id INTEGER NOT NULL,
            date DATE NOT NULL,
            time VARCHAR(50) NOT NULL
        );
    """,
    "users": """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            "emailVerified" TIMESTAMP,
            image TEXT
        );
    """
}

def parse_sql_dump(file_path):
    """
    Parses the MySQL dump and extracts INSERT statements.
    Returns a list of clean SQL statements for PostgreSQL.
    """
    if not os.path.exists(file_path):
        print(f"Error: SQL dump file not found at {file_path}")
        sys.exit(1)

    insert_statements = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract INSERT INTO statements
    # Pattern to find INSERT INTO `table` (...) VALUES ... ;
    # We use multiple regex or simple string finding because regex for nested parenthesis is hard.
    # The dump format is consistent: INSERT INTO `table` (...) VALUES ...;
    
    # Split by semicolon is risky if semicolon is in quotes.
    # But usually dumps put newline after ;
    
    # Strategy: Find "INSERT INTO", read until ";" at the end of line/block.
    
    # We can iterate through the content.
    
    # Simpler approach: regex to find the whole INSERT block?
    # The file is not huge (24KB).
    
    matches = re.finditer(r"INSERT INTO `(.*?)` \((.*?)\) VALUES", content, re.IGNORECASE)
    
    # We construct the queries manually.
    
    # Actually, replacing backticks and escaping strings might be enough if we just process the whole file as a set of commands?
    # No, we only want inserts.
    
    # Let's find specific table inserts.
    for table_name in DDL_STATEMENTS.keys():
        # Regex to capture the values part
        # INSERT INTO `table_name` (...) VALUES (tuples);
        pattern = re.compile(f"INSERT INTO `{table_name}`.*?(VALUES.*?);", re.DOTALL | re.IGNORECASE)
        match = pattern.search(content)
        if match:
            insert_cmd = match.group(0)
            
            # Convert MySQL syntax to Postgres
            # 1. Replace backticks with double quotes
            insert_cmd = insert_cmd.replace("`", '"')
            
            # 2. Fix string masking: MySQL \' -> Postgres ''
            # This is tricky because we might replace ' inside a string if we are not careful.
            # But standard replace should work for \' -> ''
            insert_cmd = insert_cmd.replace(r"\'", "''")
            
            insert_statements.append(insert_cmd)
            
    return insert_statements

def main():
    print(f"Connecting to database at {DB_HOST}:{DB_PORT}...")
    
    try:
        with ssh_tunnel():
            # Connect to "postgres" first to check db? No, check_db connects to DB_NAME directly.
            conn = psycopg.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASS,
                dbname=DB_NAME,
                connect_timeout=10
            )
            conn.autocommit = True
            
            print("Connected!")
            
            with conn.cursor() as cur:
                # 1. Drop existing tables
                print("Dropping existing tables...")
                for table in DDL_STATEMENTS.keys():
                    cur.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                
                # 2. Create tables
                print("Creating tables...")
                for table, ddl in DDL_STATEMENTS.items():
                    print(f"  Creating {table}...")
                    cur.execute(ddl)
                
                # 3. Insert data
                print("Inserting data...")
                inserts = parse_sql_dump(SQL_FILE)
                for sql in inserts:
                    # Extract table name from SQL for logging
                    match = re.search(r'INSERT INTO "([^"]+)"', sql)
                    table_name = match.group(1) if match else "unknown"
                    print(f"  Inserting into {table_name}...")
                    try:
                        cur.execute(sql)
                    except Exception as e:
                        print(f"  Error inserting into {table_name}: {e}")
                        # Print start of SQL to debug
                        print(f"  SQL snippet: {sql[:100]}...")
                        sys.exit(1)
                
                # 4. Reset sequences (fix auto-increment)
                print("Resetting sequences...")
                for table in DDL_STATEMENTS.keys():
                    try:
                        # Assuming 'id' is the serial column
                        cur.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), max(id)) FROM \"{table}\"")
                    except Exception as e:
                        print(f"  Could not reset sequence for {table} (might be empty): {e}")

            print("SUCCESS: Database seeded successfully!")
            conn.close()

    except OperationalError as e:
        print(f"FAILURE: Could not connect to database.\nError: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"FAILURE: An unexpected error occurred.\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
