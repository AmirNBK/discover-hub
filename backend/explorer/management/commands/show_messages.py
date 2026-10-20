import json

from django.core.management.base import BaseCommand

from explorer.models import ContactMessage


class Command(BaseCommand):
    help = "Read the most recent 100 contact messages from MongoDB."

    def handle(self, **options):
        for message in ContactMessage.objects.order_by("-created_at")[:100]:
            self.stdout.write(
                json.dumps(
                    {
                        "id": str(message.pk),
                        "name": message.name,
                        "email": message.email,
                        "message": message.message,
                        "created_at": message.created_at.isoformat(),
                    },
                    ensure_ascii=False,
                )
            )
