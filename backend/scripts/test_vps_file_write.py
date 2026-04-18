#!/usr/bin/env python3
from __future__ import annotations

import posixpath
from contextlib import contextmanager

import paramiko


SSH_HOST = "31.97.174.27"
SSH_PORT = 22
SSH_USER = "devuser"
SSH_KEY_PATH = "/Users/sergey.shpak79gmail.com/.ssh/vps_31_ed25519"

REMOTE_ROOT = "/home/devuser/projects/Anastasiaenargentina/backend/data/blog_media"
REMOTE_TEST_DIR = posixpath.join(REMOTE_ROOT, "_sftp_test")
REMOTE_TEST_FILE = posixpath.join(REMOTE_TEST_DIR, "test_upload.txt")


def load_private_key(path: str):
    loaders = [
        paramiko.Ed25519Key.from_private_key_file,
        paramiko.RSAKey.from_private_key_file,
        paramiko.ECDSAKey.from_private_key_file,
    ]
    last_error = None
    for loader in loaders:
        try:
            return loader(path)
        except Exception as e:
            last_error = e
    raise RuntimeError(f"Could not load SSH key: {last_error}")


def sftp_mkdir_p(sftp: paramiko.SFTPClient, remote_directory: str) -> None:
    parts = remote_directory.strip("/").split("/")
    current = ""
    for part in parts:
        current = f"{current}/{part}"
        try:
            sftp.stat(current)
        except FileNotFoundError:
            sftp.mkdir(current)


@contextmanager
def create_sftp_client():
    transport = paramiko.Transport((SSH_HOST, SSH_PORT))
    try:
        pkey = load_private_key(SSH_KEY_PATH)
        transport.connect(username=SSH_USER, pkey=pkey)
        sftp = paramiko.SFTPClient.from_transport(transport)
        try:
            yield sftp
        finally:
            sftp.close()
    finally:
        transport.close()


def main():
    content = b"hello from local mac via sftp\n"

    with create_sftp_client() as sftp:
        sftp_mkdir_p(sftp, REMOTE_TEST_DIR)

        with sftp.file(REMOTE_TEST_FILE, "wb") as f:
            f.write(content)
            f.flush()

        stat_result = sftp.stat(REMOTE_TEST_FILE)

    print("OK")
    print(f"Created: {REMOTE_TEST_FILE}")
    print(f"Size: {stat_result.st_size} bytes")


if __name__ == "__main__":
    main()