from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from pymongo import MongoClient
from pymongo.errors import AutoReconnect


class Command(BaseCommand):
    def handle(self, **options):
        uri = settings.DATABASES["default"]["HOST"]
        if uri != "mongodb://127.0.0.1:27018":
            raise CommandError(
                "Only the launcher's loopback MongoDB instance may be stopped."
            )
        try:
            with MongoClient(uri, serverSelectionTimeoutMS=2000) as client:
                client.admin.command("shutdown")
        except AutoReconnect:
            pass
