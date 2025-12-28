#!/usr/bin/env bash

set -e
set -x

# Run prestart script (database initialization, migrations, initial data)
bash scripts/prestart.sh

# Determine if we should use reload mode
# Default to reload mode unless PRODUCTION environment variable is set
if [ "${PRODUCTION:-false}" = "true" ]; then
    # Production mode: use multiple workers, no reload
    exec fastapi run --workers 4 app/main.py
else
    # Development mode: use reload for auto-restart on code changes
    exec fastapi run --reload app/main.py
fi

