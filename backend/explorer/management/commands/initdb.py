from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from pymongo import MongoClient


class Command(BaseCommand):
    help = "Apply model migrations and expiry indexes. Does not reset existing data."

    def handle(self, **options):
        call_command("migrate", interactive=False)
        call_command(
            "import_destinations",
            Path(__file__).resolve().parents[2] / "fixtures" / "destinations.json",
        )
        database = settings.DATABASES["default"]
        with MongoClient(database["HOST"], serverSelectionTimeoutMS=5000) as client:
            db = client[database["NAME"]]
            for collection in ("sessions", "rate_windows"):
                # Reuse the normal index created by the model migration and
                # convert it to TTL, keeping the ORM's index name consistent.
                for name, index in db[collection].index_information().items():
                    if index["key"] == [("expires_at", 1)]:
                        db.command(
                            {
                                "collMod": collection,
                                "index": {"name": name, "expireAfterSeconds": 0},
                            }
                        )
        self.stdout.write(
            self.style.SUCCESS("MongoDB collections and indexes are ready.")
        )
