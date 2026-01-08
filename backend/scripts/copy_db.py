#!/usr/bin/env python3
"""
Script to copy PostgreSQL database from remote server to local database.

This script:
1. Creates an SSH tunnel to the remote server
2. Dumps the remote database using pg_dump
3. Restores the dump to the local database

Usage:
    python scripts/copy_db.py [--local-db-name LOCAL_DB_NAME] [--local-db-user LOCAL_DB_USER] [--local-db-host LOCAL_DB_HOST] [--local-db-port LOCAL_DB_PORT]

If local database parameters are not provided, they will use the same values as remote database
from settings (config.py), or defaults to localhost:5432.
"""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

# Add backend directory to sys.path
_script_dir = Path(__file__).parent
_backend_dir = _script_dir.parent
sys.path.insert(0, str(_backend_dir))

from app.core.config import settings
from app.ssh_util import ssh_tunnel

# SSH host alias (same as in ssh_util.py)
SSH_HOST_ALIAS = "vps_server"
# Use different port for SSH tunnel to avoid conflict with local PostgreSQL
SSH_TUNNEL_PORT = 5433

# Remote database settings from config
REMOTE_DB_USER = settings.POSTGRES_USER
REMOTE_DB_NAME = settings.POSTGRES_DB
REMOTE_DB_PASSWORD = settings.POSTGRES_PASSWORD

# Default local database settings (use same as remote by default, can be overridden via command line)
LOCAL_DB_HOST = "localhost"
LOCAL_DB_PORT = "5432"
LOCAL_DB_USER = REMOTE_DB_USER
LOCAL_DB_PASSWORD = REMOTE_DB_PASSWORD
LOCAL_DB_NAME = REMOTE_DB_NAME


def parse_args():
    """Parse command line arguments."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Copy PostgreSQL database from remote server to local database"
    )
    parser.add_argument(
        "--local-db-name",
        default=None,
        help=f"Local database name (default: {LOCAL_DB_NAME} from settings)"
    )
    parser.add_argument(
        "--local-db-user",
        default=None,
        help=f"Local database user (default: {LOCAL_DB_USER} from settings)"
    )
    parser.add_argument(
        "--local-db-host",
        default=None,
        help=f"Local database host (default: {LOCAL_DB_HOST})"
    )
    parser.add_argument(
        "--local-db-port",
        default=None,
        help=f"Local database port (default: {LOCAL_DB_PORT})"
    )
    parser.add_argument(
        "--local-db-password",
        default=None,
        help="Local database password (default: same as remote from settings)"
    )
    parser.add_argument(
        "--drop-existing",
        action="store_true",
        help="Drop existing local database before restoring (WARNING: destroys local data)"
    )
    parser.add_argument(
        "--dump-file",
        type=str,
        help="Path to save dump file (optional, if not provided uses temporary file)"
    )
    
    return parser.parse_args()


def get_pg_dump_path():
    """Get path to pg_dump, preferring PostgreSQL 16 if available."""
    # Try PostgreSQL 16 first (for compatibility with remote server)
    pg16_path = "/opt/homebrew/opt/postgresql@16/bin/pg_dump"
    if os.path.exists(pg16_path):
        return pg16_path
    # Fall back to system pg_dump
    try:
        result = subprocess.run(
            ["which", "pg_dump"],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return "pg_dump"  # Fallback to PATH


def check_pg_dump():
    """Check if pg_dump is available."""
    pg_dump_path = get_pg_dump_path()
    try:
        subprocess.run(
            [pg_dump_path, "--version"],
            capture_output=True,
            check=True,
            timeout=5
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return False


def get_pg_restore_path():
    """Get path to pg_restore, preferring PostgreSQL 16 if available."""
    # Try PostgreSQL 16 first (for compatibility with dumps from PostgreSQL 16)
    pg16_path = "/opt/homebrew/opt/postgresql@16/bin/pg_restore"
    if os.path.exists(pg16_path):
        return pg16_path
    # Fall back to system pg_restore
    try:
        result = subprocess.run(
            ["which", "pg_restore"],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return "pg_restore"  # Fallback to PATH


def check_pg_restore():
    """Check if pg_restore is available."""
    pg_restore_path = get_pg_restore_path()
    try:
        subprocess.run(
            [pg_restore_path, "--version"],
            capture_output=True,
            check=True,
            timeout=5
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return False


def get_psql_path():
    """Get path to psql."""
    # Try PostgreSQL 14 first (local server)
    pg14_path = "/opt/homebrew/opt/postgresql@14/bin/psql"
    if os.path.exists(pg14_path):
        return pg14_path
    # Try PostgreSQL 16
    pg16_path = "/opt/homebrew/opt/postgresql@16/bin/psql"
    if os.path.exists(pg16_path):
        return pg16_path
    # Fall back to system psql
    try:
        result = subprocess.run(
            ["which", "psql"],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return "psql"  # Fallback to PATH


def check_psql():
    """Check if psql is available."""
    psql_path = get_psql_path()
    try:
        subprocess.run(
            [psql_path, "--version"],
            capture_output=True,
            check=True,
            timeout=5
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return False


def check_local_postgres_running(db_host: str, db_port: str) -> bool:
    """Check if local PostgreSQL server is running."""
    psql_path = get_psql_path()
    # Try connecting as current user first (works on macOS with Homebrew PostgreSQL)
    try:
        result = subprocess.run(
            [psql_path, "-h", db_host, "-p", db_port, "-U", os.getenv("USER", "postgres"), "-d", "postgres", "-c", "SELECT 1;"],
            capture_output=True,
            timeout=5,
            env={"PGPASSWORD": ""}  # Try without password first
        )
        if result.returncode == 0:
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
        pass
    
    # Try as postgres user
    try:
        result = subprocess.run(
            [psql_path, "-h", db_host, "-p", db_port, "-U", "postgres", "-d", "postgres", "-c", "SELECT 1;"],
            capture_output=True,
            timeout=5,
            env={"PGPASSWORD": ""}  # Try without password first
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
        return False


def create_local_user(db_user: str, db_password: str, db_host: str, db_port: str) -> bool:
    """Create local PostgreSQL user if it doesn't exist."""
    psql_path = get_psql_path()
    # Try to connect as current user (works on macOS with Homebrew PostgreSQL)
    current_user = os.getenv("USER", "postgres")
    
    # Check if user exists
    check_cmd = [
        psql_path,
        "-h", db_host,
        "-p", db_port,
        "-U", current_user,
        "-d", "postgres",
        "-tAc", f"SELECT 1 FROM pg_roles WHERE rolname='{db_user}';"
    ]
    
    try:
        result = subprocess.run(
            check_cmd,
            capture_output=True,
            text=True,
            timeout=5,
            env={"PGPASSWORD": ""}
        )
        if result.returncode == 0 and "1" in result.stdout:
            print(f"✓ Local user '{db_user}' already exists")
            return False
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # Create user
    print(f"Creating local user '{db_user}'...")
    # Escape single quotes in password for SQL
    escaped_password = db_password.replace("'", "''")
    create_cmd = [
        psql_path,
        "-h", db_host,
        "-p", db_port,
        "-U", current_user,
        "-d", "postgres",
        "-c", f"CREATE USER {db_user} WITH PASSWORD '{escaped_password}';"
    ]
    
    try:
        result = subprocess.run(
            create_cmd,
            capture_output=True,
            text=True,
            timeout=10,
            env={"PGPASSWORD": ""}
        )
        if result.returncode == 0:
            print(f"✓ Local user '{db_user}' created successfully")
            return True
        else:
            print(f"⚠ Failed to create user: {result.stderr}")
            return False
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"⚠ Failed to create user: {e}")
        return False


def create_local_database(db_name: str, db_user: str, db_host: str, db_port: str, db_password: str):
    """Create local database if it doesn't exist."""
    # Check if PostgreSQL server is running
    if not check_local_postgres_running(db_host, db_port):
        print(f"⚠ Warning: Cannot connect to PostgreSQL server at {db_host}:{db_port}")
        print(f"  Please make sure PostgreSQL is running locally.")
        print(f"  You can start it with: brew services start postgresql@14 (or your version)")
        print(f"  Or skip local database creation and restore directly if database already exists.")
        return False
    
    print(f"Checking if local database '{db_name}' exists...")
    
    psql_path = get_psql_path()
    current_user = os.getenv("USER", "postgres")
    
    # Check if database exists (connect as current user, which has permissions)
    check_cmd = [
        psql_path,
        "-h", db_host,
        "-p", db_port,
        "-U", current_user,
        "-d", "postgres",
        "-tAc", f"SELECT 1 FROM pg_database WHERE datname='{db_name}';"
    ]
    
    try:
        result = subprocess.run(
            check_cmd,
            capture_output=True,
            text=True,
            timeout=10,
            env={"PGPASSWORD": ""}
        )
        if result.returncode == 0 and "1" in result.stdout:
            print(f"✓ Local database '{db_name}' already exists")
            # Grant privileges to the user
            grant_cmd = [
                psql_path,
                "-h", db_host,
                "-p", db_port,
                "-U", current_user,
                "-d", db_name,
                "-c", f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};"
            ]
            subprocess.run(grant_cmd, capture_output=True, timeout=5, env={"PGPASSWORD": ""})
            return False
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # Create database as current user (which has CREATEDB permission)
    print(f"Creating local database '{db_name}'...")
    create_cmd = [
        psql_path,
        "-h", db_host,
        "-p", db_port,
        "-U", current_user,
        "-d", "postgres",  # Connect to default database to create new one
        "-c", f"CREATE DATABASE {db_name} OWNER {db_user};"
    ]
    
    try:
        result = subprocess.run(
            create_cmd,
            capture_output=True,
            text=True,
            timeout=10,
            env={"PGPASSWORD": ""}
        )
        if result.returncode == 0:
            print(f"✓ Local database '{db_name}' created successfully")
            # Grant all privileges to the user
            grant_cmd = [
                psql_path,
                "-h", db_host,
                "-p", db_port,
                "-U", current_user,
                "-d", db_name,
                "-c", f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};"
            ]
            subprocess.run(grant_cmd, capture_output=True, timeout=5, env={"PGPASSWORD": ""})
            return True
        else:
            print(f"⚠ Failed to create database: {result.stderr}")
            return False
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"⚠ Failed to create database: {e}")
        if "Connection refused" in str(e):
            print(f"  Make sure PostgreSQL is running at {db_host}:{db_port}")
        return False


def drop_local_database(db_name: str, db_user: str, db_host: str, db_port: str, db_password: str):
    """Drop local database."""
    print(f"⚠ Dropping local database '{db_name}'...")
    
    psql_path = get_psql_path()
    drop_cmd = [
        psql_path,
        "-h", db_host,
        "-p", db_port,
        "-U", db_user,
        "-d", "postgres",  # Connect to default database to drop target database
        "-c", f"DROP DATABASE IF EXISTS {db_name};"
    ]
    
    env = os.environ.copy()
    if db_password:
        env["PGPASSWORD"] = db_password
    
    try:
        subprocess.run(
            drop_cmd,
            env=env,
            check=True,
            timeout=10
        )
        print(f"✓ Local database '{db_name}' dropped successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to drop database: {e}")
        return False


def dump_remote_database(dump_file: Path, db_user: str, db_password: str, db_name: str) -> bool:
    """Dump remote database through SSH tunnel using local pg_dump."""
    print(f"Dumping remote database '{db_name}' through SSH tunnel...")
    
    # Get pg_dump path (prefer PostgreSQL 16 for compatibility)
    pg_dump_path = get_pg_dump_path()
    
    # Build pg_dump command (using local pg_dump through SSH tunnel)
    dump_cmd = [
        pg_dump_path,
        "-h", "127.0.0.1",
        "-p", str(SSH_TUNNEL_PORT),  # Use SSH tunnel port (not local PostgreSQL port)
        "-U", db_user,
        "-d", db_name,
        "-F", "c",  # Custom format (compressed)
        "-f", str(dump_file),
        "-v"  # Verbose
    ]
    
    env = os.environ.copy()
    env["PGPASSWORD"] = db_password
    
    try:
        result = subprocess.run(
            dump_cmd,
            env=env,
            capture_output=True,
            text=True,
            timeout=600  # 10 minutes timeout
        )
        
        if result.returncode != 0:
            print(f"❌ pg_dump failed:")
            print(result.stderr)
            # Check if it's a version mismatch error
            if "version mismatch" in result.stderr.lower():
                print()
                print("💡 Version mismatch detected. Solutions:")
                print("   1. Install PostgreSQL 16 client tools locally:")
                print("      brew install postgresql@16")
                print("      Then use: /opt/homebrew/opt/postgresql@16/bin/pg_dump")
                print("   2. Or use --no-version-check flag (if available in your pg_dump version)")
            return False
        
        if not dump_file.exists() or dump_file.stat().st_size == 0:
            print(f"❌ Dump file is empty or doesn't exist")
            return False
        
        print(f"✓ Database dumped successfully to {dump_file}")
        print(f"  Dump size: {dump_file.stat().st_size / 1024 / 1024:.2f} MB")
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ pg_dump timed out (took more than 10 minutes)")
        return False
    except Exception as e:
        print(f"❌ Error during dump: {e}")
        return False


def restore_local_database(
    dump_file: Path,
    db_name: str,
    db_user: str,
    db_host: str,
    db_port: str,
    db_password: str
) -> bool:
    """Restore dump to local database."""
    print(f"Restoring dump to local database '{db_name}'...")
    
    # Get pg_restore path (prefer PostgreSQL 16 for compatibility with dumps from PostgreSQL 16)
    pg_restore_path = get_pg_restore_path()
    
    # Build pg_restore command
    restore_cmd = [
        pg_restore_path,
        "-h", db_host,
        "-p", db_port,
        "-U", db_user,
        "-d", db_name,
        "-v",  # Verbose
        "--clean",  # Clean (drop) database objects before recreating
        "--if-exists",  # Don't error if object doesn't exist
        str(dump_file)
    ]
    
    env = os.environ.copy()
    if db_password:
        env["PGPASSWORD"] = db_password
    
    try:
        result = subprocess.run(
            restore_cmd,
            env=env,
            capture_output=True,
            text=True,
            timeout=600  # 10 minutes timeout
        )
        
        if result.returncode != 0:
            print(f"⚠ pg_restore completed with warnings/errors:")
            print(result.stderr)
            # Check if it's just warnings or actual errors
            if "ERROR" in result.stderr.upper():
                print("❌ Restore failed due to errors")
                return False
            else:
                print("✓ Restore completed (with warnings)")
                return True
        
        print(f"✓ Database restored successfully to '{db_name}'")
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ pg_restore timed out (took more than 10 minutes)")
        return False
    except Exception as e:
        print(f"❌ Error during restore: {e}")
        return False


def main():
    """Main function."""
    args = parse_args()
    
    # Check required tools
    print("Checking required tools...")
    if not check_pg_dump():
        print("❌ pg_dump not found. Please install PostgreSQL client tools.")
        sys.exit(1)
    if not check_pg_restore():
        print("❌ pg_restore not found. Please install PostgreSQL client tools.")
        sys.exit(1)
    if not check_psql():
        print("❌ psql not found. Please install PostgreSQL client tools.")
        sys.exit(1)
    print("✓ All required tools are available")
    print()
    
    # Validate remote database settings
    if not REMOTE_DB_PASSWORD:
        print("❌ POSTGRES_PASSWORD not found in settings (config.py)")
        sys.exit(1)
    if not REMOTE_DB_NAME:
        print("❌ POSTGRES_DB not found in settings (config.py)")
        sys.exit(1)
    if not REMOTE_DB_USER:
        print("❌ POSTGRES_USER not found in settings (config.py)")
        sys.exit(1)
    
    # Determine local database settings (use command line args or defaults from settings)
    local_db_name = args.local_db_name or LOCAL_DB_NAME
    local_db_user = args.local_db_user or LOCAL_DB_USER
    local_db_host = args.local_db_host or LOCAL_DB_HOST
    local_db_port = args.local_db_port or LOCAL_DB_PORT
    local_db_password = args.local_db_password or LOCAL_DB_PASSWORD
    
    # Determine dump file path
    if args.dump_file:
        dump_file = Path(args.dump_file)
        dump_file.parent.mkdir(parents=True, exist_ok=True)
    else:
        # Use temporary file
        temp_dir = tempfile.gettempdir()
        dump_file = Path(temp_dir) / f"{REMOTE_DB_NAME}_dump_{os.getpid()}.dump"
    
    print(f"Remote database: {REMOTE_DB_NAME}@{REMOTE_DB_USER} (via SSH tunnel)")
    print(f"Local database: {local_db_name}@{local_db_user} ({local_db_host}:{local_db_port})")
    print(f"Dump file: {dump_file}")
    print()
    
    # Drop existing database if requested
    if args.drop_existing:
        if not drop_local_database(local_db_name, local_db_user, local_db_host, local_db_port, local_db_password):
            print("❌ Failed to drop existing database")
            sys.exit(1)
        print()
    
    # Create local user if it doesn't exist
    create_local_user(local_db_user, local_db_password, local_db_host, local_db_port)
    print()
    
    # Create local database if it doesn't exist
    create_local_database(local_db_name, local_db_user, local_db_host, local_db_port, local_db_password)
    print()
    
    # Dump remote database through SSH tunnel
    print("Establishing SSH tunnel and dumping remote database...")
    try:
        # Use different port for SSH tunnel to avoid conflict with local PostgreSQL
        with ssh_tunnel(local_port=SSH_TUNNEL_PORT):
            if not dump_remote_database(dump_file, REMOTE_DB_USER, REMOTE_DB_PASSWORD, REMOTE_DB_NAME):
                print("❌ Failed to dump remote database")
                sys.exit(1)
    except Exception as e:
        print(f"❌ SSH tunnel error: {e}")
        sys.exit(1)
    
    print()
    
    # Restore to local database
    if not restore_local_database(
        dump_file,
        local_db_name,
        local_db_user,
        local_db_host,
        local_db_port,
        local_db_password
    ):
        print("❌ Failed to restore database")
        sys.exit(1)
    
    print()
    
    # Clean up temporary dump file if it was created automatically
    if not args.dump_file and dump_file.exists():
        print(f"Cleaning up temporary dump file: {dump_file}")
        dump_file.unlink()
    
    print()
    print("✓ Database copy completed successfully!")
    print(f"  Local database '{local_db_name}' is ready to use.")


if __name__ == "__main__":
    main()

