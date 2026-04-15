"""
scripts/seed.py
────────────────
Populate the database with sample users and reports for development/demo.

Usage:
    python -m scripts.seed
    # or with custom DB URL:
    DATABASE_URL=postgresql://... python -m scripts.seed
"""

import sys
import os

# Allow running from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.report import Report, ReportStatus
from app.models.user import User, UserRole

# ── Sample data ───────────────────────────────────────────────────────────────
USERS = [
    {
        "name": "Admin EcoAlerta",
        "email": "admin@ecoalerta.com",
        "password": "Admin2024!",
        "role": UserRole.admin,
    },
    {
        "name": "Carlos Méndez",
        "email": "carlos@example.com",
        "password": "carlos123",
        "role": UserRole.user,
    },
    {
        "name": "Laura Gómez",
        "email": "laura@example.com",
        "password": "laura456",
        "role": UserRole.user,
    },
    {
        "name": "Andrés Torres",
        "email": "andres@example.com",
        "password": "andres789",
        "role": UserRole.user,
    },
]

# Coordinates are centered around Bucaramanga, Colombia
REPORTS = [
    {
        "title": "Basura acumulada en Parque García Rovira",
        "description": (
            "Hay bolsas de basura sin recoger desde hace 4 días junto a los bancas "
            "del parque. El olor es fuerte y atrae insectos."
        ),
        "latitude": 7.1254,
        "longitude": -73.1198,
        "image_url": "https://picsum.photos/seed/report1/800/600",
        "status": ReportStatus.pending,
        "user_email": "carlos@example.com",
    },
    {
        "title": "Escombros bloqueando andén en Cabecera",
        "description": (
            "Una obra dejó escombros en el andén de la Calle 48 con Carrera 33, "
            "impidiendo el paso de peatones y personas en silla de ruedas."
        ),
        "latitude": 7.1198,
        "longitude": -73.1089,
        "image_url": "https://picsum.photos/seed/report2/800/600",
        "status": ReportStatus.in_progress,
        "user_email": "laura@example.com",
    },
    {
        "title": "Contenedor de basura desbordado en La Floresta",
        "description": (
            "El contenedor público lleva más de 2 días sin vaciar. La basura "
            "está desbordada sobre la vía y genera malos olores."
        ),
        "latitude": 7.1312,
        "longitude": -73.1245,
        "image_url": "https://picsum.photos/seed/report3/800/600",
        "status": ReportStatus.resolved,
        "user_email": "andres@example.com",
    },
    {
        "title": "Vertimiento de aceite en Quebrada La Iglesia",
        "description": (
            "Se observa vertimiento de aceite y líquidos oscuros que están llegando "
            "a la quebrada. Aparentemente proviene de un taller mecánico cercano."
        ),
        "latitude": 7.0985,
        "longitude": -73.1156,
        "image_url": "https://picsum.photos/seed/report4/800/600",
        "status": ReportStatus.pending,
        "user_email": "carlos@example.com",
    },
    {
        "title": "Llantas abandonadas en vía pública – Ciudadela Real de Minas",
        "description": (
            "Aproximadamente 15 llantas usadas fueron abandonadas en el separador "
            "de la Autopista a Floridablanca, generando un foco de mosquitos."
        ),
        "latitude": 7.0872,
        "longitude": -73.1067,
        "image_url": "https://picsum.photos/seed/report5/800/600",
        "status": ReportStatus.in_progress,
        "user_email": "laura@example.com",
    },
    {
        "title": "Punto crítico de basura en Mercado de Piedecuesta",
        "description": (
            "Cada semana se acumula basura orgánica e inorgánica sin clasificar "
            "en los alrededores del mercado. Solicito recogida con mayor frecuencia."
        ),
        "latitude": 6.9876,
        "longitude": -73.0511,
        "image_url": "https://picsum.photos/seed/report6/800/600",
        "status": ReportStatus.pending,
        "user_email": "andres@example.com",
    },
]


def seed() -> None:
    print("🌱 EcoAlerta – Database Seeder")
    print("─" * 40)

    # Create tables if they don't exist yet
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ── Seed users ────────────────────────────────────────────────────────
        email_to_user: dict[str, User] = {}
        for u_data in USERS:
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if existing:
                print(f"  ⏭  User already exists: {u_data['email']}")
                email_to_user[u_data["email"]] = existing
                continue

            user = User(
                name=u_data["name"],
                email=u_data["email"],
                hashed_password=hash_password(u_data["password"]),
                role=u_data["role"],
            )
            db.add(user)
            db.flush()  # get user.id before commit
            email_to_user[u_data["email"]] = user
            role_label = "🔑 admin" if u_data["role"] == UserRole.admin else "👤 user"
            print(f"  ✅ Created {role_label}: {u_data['email']}  (pwd: {u_data['password']})")

        db.commit()

        # ── Seed reports ──────────────────────────────────────────────────────
        for r_data in REPORTS:
            author = email_to_user.get(r_data["user_email"])
            if not author:
                print(f"  ⚠  Author not found for report: {r_data['title'][:40]}")
                continue

            existing = db.query(Report).filter(Report.title == r_data["title"]).first()
            if existing:
                print(f"  ⏭  Report already exists: {r_data['title'][:50]}")
                continue

            report = Report(
                title=r_data["title"],
                description=r_data["description"],
                latitude=r_data["latitude"],
                longitude=r_data["longitude"],
                image_url=r_data["image_url"],
                status=r_data["status"],
                user_id=author.id,
            )
            db.add(report)
            status_emoji = {"pending": "🟡", "in_progress": "🔵", "resolved": "🟢"}
            emoji = status_emoji.get(r_data["status"].value, "⚪")
            print(f"  {emoji} Created report: {r_data['title'][:50]}")

        db.commit()

        print("─" * 40)
        print("✅ Seed completed successfully!")
        print(f"\n📋 Admin credentials:")
        print(f"   Email:    admin@ecoalerta.com")
        print(f"   Password: Admin2024!")
        print(f"\n🌐 Swagger UI: http://localhost:8000/docs")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
