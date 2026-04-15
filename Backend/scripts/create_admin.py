"""
scripts/create_admin.py
────────────────────────
Interactive CLI to promote an existing user to admin role,
or create a brand-new admin account directly from the terminal.

Usage:
    python -m scripts.create_admin
"""

import sys
import os
import getpass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User, UserRole


def create_or_promote_admin() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("╔══════════════════════════════════╗")
    print("║   EcoAlerta – Create Admin CLI   ║")
    print("╚══════════════════════════════════╝\n")

    email = input("Email: ").strip().lower()
    if not email:
        print("❌ Email cannot be empty.")
        sys.exit(1)

    try:
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            # ── Promote existing user ──────────────────────────────────────
            if existing_user.role == UserRole.admin:
                print(f"ℹ  '{email}' is already an admin.")
                return

            confirm = input(
                f"User '{existing_user.name}' found. Promote to admin? [y/N]: "
            ).strip().lower()
            if confirm != "y":
                print("Aborted.")
                return

            existing_user.role = UserRole.admin
            db.commit()
            print(f"✅ '{existing_user.name}' has been promoted to admin.")

        else:
            # ── Create new admin account ───────────────────────────────────
            print(f"No user found with email '{email}'. Creating new admin account.\n")
            name = input("Full name: ").strip()
            if not name:
                print("❌ Name cannot be empty.")
                sys.exit(1)

            password = getpass.getpass("Password (min 8 chars, at least 1 digit): ")
            if len(password) < 8 or not any(c.isdigit() for c in password):
                print("❌ Password must be at least 8 characters and contain a digit.")
                sys.exit(1)

            confirm_pw = getpass.getpass("Confirm password: ")
            if password != confirm_pw:
                print("❌ Passwords do not match.")
                sys.exit(1)

            user = User(
                name=name,
                email=email,
                hashed_password=hash_password(password),
                role=UserRole.admin,
            )
            db.add(user)
            db.commit()
            print(f"\n✅ Admin account created successfully!")
            print(f"   Name:  {name}")
            print(f"   Email: {email}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    create_or_promote_admin()
