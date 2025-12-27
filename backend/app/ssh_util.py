import os
import socket
import subprocess
import time
import psycopg
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

SSH_HOST_ALIAS = "vps_server"   # как в ~/.ssh/config
LOCAL_PORT = 5432
REMOTE_HOST = "127.0.0.1"
REMOTE_PORT = 5432

DB_USER = "app_user"
DB_PASS = os.getenv("POSTGRES_PASSWORD")
DB_NAME = "anastasia_db"


def wait_port(host: str, port: int, timeout_s: float = 5.0) -> None:
    deadline = time.time() + timeout_s
    last_err = None
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return
        except OSError as e:
            last_err = e
            time.sleep(0.1)
    raise TimeoutError(f"Port {host}:{port} not ready. Last error: {last_err}")


@contextmanager
def ssh_tunnel(local_port: int = LOCAL_PORT):
    # -N: no remote command
    # -L: local port forward
    # -o ExitOnForwardFailure=yes: fail fast if port bind/forward fails
    # -o ServerAlive*: keepalive
    cmd = [
        "ssh",
        "-N",
        "-L", f"{local_port}:{REMOTE_HOST}:{REMOTE_PORT}",
        "-o", "ExitOnForwardFailure=yes",
        "-o", "ServerAliveInterval=30",
        "-o", "ServerAliveCountMax=3",
        SSH_HOST_ALIAS,
    ]

    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    try:
        # ждём пока ssh реально поднял прослушивание порта
        wait_port("127.0.0.1", local_port, timeout_s=8.0)
        yield
    except Exception:
        # выведем stderr ssh для диагностики
        try:
            err = proc.stderr.read()
        except Exception:
            err = ""
        raise RuntimeError(f"SSH tunnel failed.\nssh stderr:\n{err}") from None
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()


def main():
    with ssh_tunnel():
        conn = psycopg.connect(
            host="127.0.0.1",
            port=str(LOCAL_PORT),
            user=DB_USER,
            password=DB_PASS,
            dbname=DB_NAME,
            connect_timeout=5,
        )
        with conn.cursor() as cur:
            cur.execute("select version()")
            print(cur.fetchone()[0])
        conn.close()


if __name__ == "__main__":
    main()

