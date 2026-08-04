from __future__ import annotations

import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
MIGRATIONS_DIR = PROJECT_ROOT / "database" / "migrations"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from models.database import validate_database_url


def ensure_migration_table(cursor) -> None:
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        """
    )


def applied_migrations(cursor) -> set[str]:
    cursor.execute("SELECT version FROM schema_migrations;")
    return {row[0] for row in cursor.fetchall()}


def run() -> None:
    load_dotenv(BACKEND_ROOT / ".env")
    database_url = validate_database_url(os.getenv("DATABASE_URL"))

    if not MIGRATIONS_DIR.exists():
        raise FileNotFoundError(f"Migration directory not found: {MIGRATIONS_DIR}")

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        raise FileNotFoundError(f"No SQL migrations found in: {MIGRATIONS_DIR}")

    with psycopg2.connect(database_url) as connection:
        with connection.cursor() as cursor:
            ensure_migration_table(cursor)
            completed = applied_migrations(cursor)

            pending = [migration for migration in migration_files if migration.name not in completed]
            if not pending:
                print("No pending migrations.")
                return

            for migration in pending:
                sql = migration.read_text(encoding="utf-8")
                cursor.execute(sql)
                cursor.execute(
                    "INSERT INTO schema_migrations (version) VALUES (%s)",
                    (migration.name,),
                )
                print(f"Applied migration: {migration.name}")


if __name__ == "__main__":
    run()
