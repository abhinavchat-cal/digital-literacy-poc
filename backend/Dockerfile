# Use Python 3.11 slim image as base
FROM python:3.11-slim AS builder

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache


# Set working directory
WORKDIR /app

COPY pyproject.toml poetry.lock README.md ./

COPY backend ./backend

RUN python -m pip install --upgrade pip && \
    python -m pip install poetry && \
    poetry install --without dev && \
    rm -rf $POETRY_CACHE_DIR

# final stage
FROM python:3.11-slim AS runtime

WORKDIR /app

EXPOSE 8000

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

# Copy installed venv from builder
COPY --from=builder /app/.venv /app/.venv

COPY backend ./backend

COPY alembic ./alembic

COPY alembic.ini ./alembic.ini


# Run FastAPI app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
