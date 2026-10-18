import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from explorer.models import ContactMessage, Session, User


class Command(BaseCommand):
    help = "Import a previous SQLite database read-only, without replacing existing MongoDB records."

    def add_arguments(self, parser):
        parser.add_argument("source")

    def handle(self, source, **options):
        path = Path(source).resolve()
        if not path.is_file():
            raise CommandError("The SQLite source does not exist.")
        counts = {"users": 0, "messages": 0, "sessions": 0}
        with closing(
            sqlite3.connect(f"{path.as_uri()}?mode=ro", uri=True)
        ) as connection:
            connection.row_factory = sqlite3.Row
            tables = {
                row[0]
                for row in connection.execute(
                    "SELECT name FROM sqlite_master WHERE type='table'"
                )
            }
            mapping = {}
            if "users" in tables:
                for row in connection.execute("SELECT * FROM users"):
                    salt, hashed = row["password_hash"].split(":")
                    user, created = User.objects.get_or_create(
                        email=row["email"].strip().lower(),
                        defaults={
                            "name": row["name"],
                            "password": f"legacy_scrypt${salt}${hashed}",
                            "created_at": self.date(row["created_at"]),
                        },
                    )
                    mapping[row["id"]] = user
                    # Existing MongoDB users must not receive an old user's session.
                    if (
                        not created
                        and user.password != f"legacy_scrypt${salt}${hashed}"
                    ):
                        mapping.pop(row["id"])
                    counts["users"] += created
            if "messages" in tables:
                for row in connection.execute("SELECT * FROM messages"):
                    _, created = ContactMessage.objects.get_or_create(
                        legacy_id=row["id"],
                        defaults={
                            "name": row["name"],
                            "email": row["email"],
                            "message": row["message"],
                            "created_at": self.date(row["created_at"]),
                        },
                    )
                    counts["messages"] += created
            if "sessions" in tables:
                for row in connection.execute("SELECT * FROM sessions"):
                    expiry = datetime.fromtimestamp(row["expires_at"] / 1000, tz=UTC)
                    if row["user_id"] in mapping and expiry > datetime.now(UTC):
                        _, created = Session.objects.get_or_create(
                            token_hash=row["token_hash"],
                            defaults={
                                "user": mapping[row["user_id"]],
                                "expires_at": expiry,
                            },
                        )
                        counts["sessions"] += created
        self.stdout.write(
            self.style.SUCCESS(f"Imported: {counts}. SQLite source left unchanged.")
        )

    @staticmethod
    def date(value):
        return datetime.fromisoformat(value).replace(tzinfo=UTC)
