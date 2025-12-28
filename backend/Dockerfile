FROM python:3.10

ENV PYTHONUNBUFFERED=1

WORKDIR /app/

# --- ADD: install Node + MJML (for email templates build) ---
RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs npm \
    && npm install -g mjml \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# ------------------------------------------------------------

# Install uv
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

# Place executables in the environment at the front of the path
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#using-the-environment
ENV PATH="/app/.venv/bin:$PATH"

# Compile bytecode
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#compiling-bytecode
ENV UV_COMPILE_BYTECODE=1

# uv Cache
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#caching
ENV UV_LINK_MODE=copy

# Install dependencies
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

ENV PYTHONPATH=/app

COPY ./scripts /app/scripts

COPY ./pyproject.toml ./uv.lock ./alembic.ini /app/

COPY ./app /app/app
COPY ./tests /app/tests

# --- ADD: compile MJML templates into HTML build/ folder ---
RUN mkdir -p /app/app/email-templates/build \
    && if [ -d /app/app/email-templates/src ] && [ -n "$(ls -A /app/app/email-templates/src/*.mjml 2>/dev/null)" ]; then \
        for file in /app/app/email-templates/src/*.mjml; do \
            filename=$(basename "$file" .mjml); \
            echo "Compiling $file to ${filename}.html"; \
            mjml "$file" -o "/app/app/email-templates/build/${filename}.html" || exit 1; \
        done \
        && echo "MJML templates compiled successfully:" \
        && ls -la /app/app/email-templates/build/; \
    else \
        echo "Warning: No MJML templates found in /app/app/email-templates/src/"; \
    fi
# ----------------------------------------------------------

# Sync the project
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
