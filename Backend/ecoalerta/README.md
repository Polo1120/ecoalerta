# 🌿 EcoAlerta API

Backend REST API for **EcoAlerta**, a geolocated reporting system that allows citizens
to report urban waste issues and administrators to track their resolution.

Built with **FastAPI · PostgreSQL · SQLAlchemy · JWT · bcrypt**.

---

## 📁 Project Structure

```
ecoalerta/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py        # /auth/register, /auth/login
│   │       │   └── reports.py     # /reports CRUD
│   │       ├── deps.py            # Auth dependencies (get_current_user, get_current_admin)
│   │       └── router.py          # Aggregates all routers under /api/v1
│   ├── core/
│   │   ├── config.py              # Settings loaded from .env via pydantic-settings
│   │   ├── exceptions.py          # Domain HTTP exceptions
│   │   └── security.py            # JWT + bcrypt helpers
│   ├── db/
│   │   ├── base.py                # DeclarativeBase + model imports for Alembic
│   │   └── session.py             # Engine, SessionLocal, get_db dependency
│   ├── models/
│   │   ├── user.py                # User ORM model
│   │   └── report.py              # Report ORM model
│   ├── schemas/
│   │   ├── user.py                # Pydantic schemas for User
│   │   └── report.py              # Pydantic schemas for Report + pagination
│   ├── services/
│   │   ├── auth_service.py        # Registration & login business logic
│   │   └── report_service.py      # Report CRUD business logic
│   └── main.py                    # App factory, CORS, exception handlers
├── alembic/                        # Database migrations
│   ├── versions/
│   │   └── 0001_initial.py        # Initial schema migration
│   └── env.py
├── tests/
│   ├── conftest.py                # Pytest fixtures (TestClient + SQLite)
│   ├── test_auth.py
│   └── test_reports.py
├── .env.example
├── alembic.ini
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

## 🚀 Quick Start

### Option A — Docker Compose (recommended)

```bash
# 1. Clone and enter the project
git clone https://github.com/your-org/ecoalerta-api.git
cd ecoalerta-api

# 2. Create your .env file
cp .env.example .env
# Edit SECRET_KEY with: openssl rand -hex 32

# 3. Start all services
docker compose up --build

# API → http://localhost:8000
# Docs → http://localhost:8000/docs
```

### Option B — Local development

```bash
# 1. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Set DATABASE_URL and SECRET_KEY in .env

# 4. Run database migrations
alembic upgrade head

# 5. Start the development server
uvicorn app.main:app --reload
```

---

## 🔑 Authentication

All protected endpoints require a **Bearer token** in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

Obtain a token via `POST /api/v1/auth/login`.

### Roles

| Role    | Permissions                                      |
|---------|--------------------------------------------------|
| `user`  | Create reports, view reports                     |
| `admin` | All user permissions + update report status      |

---

## 📡 API Endpoints

### Auth

| Method | Path                    | Auth     | Description              |
|--------|-------------------------|----------|--------------------------|
| POST   | `/api/v1/auth/register` | —        | Create a new user account |
| POST   | `/api/v1/auth/login`    | —        | Log in, receive JWT token |

### Reports

| Method | Path                             | Auth    | Description                       |
|--------|----------------------------------|---------|-----------------------------------|
| POST   | `/api/v1/reports`                | User    | Submit a new waste report          |
| GET    | `/api/v1/reports`                | User    | List reports (paginated)           |
| GET    | `/api/v1/reports/{id}`           | User    | Get report detail with author info |
| PUT    | `/api/v1/reports/{id}/status`    | Admin   | Update report workflow status      |

### Query Parameters for `GET /reports`

| Param       | Default | Description                              |
|-------------|---------|------------------------------------------|
| `page`      | `1`     | Page number (1-based)                    |
| `page_size` | `20`    | Items per page (max 100)                 |
| `status`    | —       | Filter: `pending`, `in_progress`, `resolved` |

---

## 📋 Example Requests

### Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "María López", "email": "maria@eco.com", "password": "verde2024"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "maria@eco.com", "password": "verde2024"}'
```

### Create report
```bash
curl -X POST http://localhost:8000/api/v1/reports \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Basura acumulada en Calle 5",
    "description": "Llevan más de 3 días sin recoger la basura.",
    "latitude": 7.0728,
    "longitude": -73.1126,
    "image_url": "https://cdn.example.com/foto.jpg"
  }'
```

---

## 🗄️ Database Migrations (Alembic)

```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "add field X to reports"

# Rollback last migration
alembic downgrade -1
```

---

## 🧪 Running Tests

```bash
# Install test dependencies (already in requirements.txt)
pytest tests/ -v

# With coverage report
pytest tests/ --cov=app --cov-report=term-missing
```

Tests use an **in-memory SQLite** database — no PostgreSQL instance required.

---

## ⚙️ Environment Variables

| Variable                       | Required | Default   | Description                          |
|--------------------------------|----------|-----------|--------------------------------------|
| `DATABASE_URL`                 | ✅       | —         | PostgreSQL connection string          |
| `SECRET_KEY`                   | ✅       | —         | JWT signing secret (min 32 chars)     |
| `ALGORITHM`                    | —        | `HS256`   | JWT algorithm                         |
| `ACCESS_TOKEN_EXPIRE_MINUTES`  | —        | `60`      | Token lifetime in minutes             |
| `APP_ENV`                      | —        | `development` | Environment name                 |
| `DEBUG`                        | —        | `false`   | Show full tracebacks on 500 errors    |
| `ALLOWED_ORIGINS`              | —        | `http://localhost:3000` | Comma-separated CORS origins |

---

## 🔗 Interactive Documentation

| URL                              | Description              |
|----------------------------------|--------------------------|
| `http://localhost:8000/docs`     | Swagger UI               |
| `http://localhost:8000/redoc`    | ReDoc                    |
| `http://localhost:8000/health`   | Health check endpoint    |

---

## 🏗️ React Frontend Integration

```typescript
// api/client.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json(); // { access_token, token_type, user }
}

export async function getReports(token: string, page = 1) {
  const res = await fetch(`${BASE_URL}/reports?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json(); // { total, page, page_size, results: Report[] }
}
```
