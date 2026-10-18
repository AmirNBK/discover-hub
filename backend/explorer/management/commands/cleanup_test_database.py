from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from pymongo import MongoClient


class Command(BaseCommand):
    def handle(self, **options):
        db = settings.DATABASES["default"]
        if not db["NAME"].startswith("discoverhub_e2e_"):
            raise CommandError("Refusing to clean a non-test database.")
        with MongoClient(db["HOST"], serverSelectionTimeoutMS=2000) as client:
            client.drop_database(db["NAME"])
