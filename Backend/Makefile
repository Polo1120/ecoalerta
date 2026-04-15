# ─────────────────────────────────────────────────────────────────────────────
# EcoAlerta – Makefile
# Common development commands. Run `make help` for a list.
# ─────────────────────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help
.PHONY: help install dev docker-up docker-down migrate migrate-create seed create-admin test lint format

# ── Variables ──────────────────────────────────────────────────────────────────
PYTHON  := python
UVICORN := uvicorn app.main:app
ALEMBIC := alembic

# ─────────────────────────────────────────────────────────────────────────────

help:  ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Setup ──────────────────────────────────────────────────────────────────────

install:  ## Create venv and install dependencies
	$(PYTHON) -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -r requirements.txt
	@echo "\n✅  Run: source .venv/bin/activate"

# ── Development server ────────────────────────────────────────────────────────

dev:  ## Start FastAPI dev server with hot reload
	$(UVICORN) --reload --host 0.0.0.0 --port 8000

# ── Docker ────────────────────────────────────────────────────────────────────

docker-up:  ## Start all services with Docker Compose
	docker compose up --build

docker-up-detached:  ## Start all services in background
	docker compose up --build -d

docker-down:  ## Stop and remove containers
	docker compose down

docker-logs:  ## Tail API container logs
	docker compose logs -f api

# ── Database ──────────────────────────────────────────────────────────────────

migrate:  ## Apply all pending Alembic migrations
	$(ALEMBIC) upgrade head

migrate-create:  ## Create a new migration (usage: make migrate-create msg="add field")
	$(ALEMBIC) revision --autogenerate -m "$(msg)"

migrate-down:  ## Roll back the last migration
	$(ALEMBIC) downgrade -1

migrate-history:  ## Show migration history
	$(ALEMBIC) history --verbose

seed:  ## Populate DB with sample data
	$(PYTHON) -m scripts.seed

create-admin:  ## Interactive CLI to create or promote an admin user
	$(PYTHON) -m scripts.create_admin

# ── Testing ───────────────────────────────────────────────────────────────────

test:  ## Run all tests
	pytest tests/ -v

test-cov:  ## Run tests with coverage report
	pytest tests/ --cov=app --cov-report=term-missing --cov-report=html

# ── Code quality ──────────────────────────────────────────────────────────────

lint:  ## Run ruff linter
	ruff check app/ tests/

format:  ## Format code with ruff
	ruff format app/ tests/

check: lint test  ## Run lint + tests together
