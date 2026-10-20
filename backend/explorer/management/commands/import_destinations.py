import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from explorer.catalogue import validate_record
from explorer.models import Destination


class Command(BaseCommand):
    help = "Validate and import catalogue JSON. Existing records are preserved unless --update is supplied."

    def add_arguments(self, parser):
        parser.add_argument("source", type=Path)
        parser.add_argument("--update", action="store_true")
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, source, update, dry_run, **options):
        try:
            records = json.loads(source.read_text(encoding="utf-8"))
            if not isinstance(records, list) or not 1 <= len(records) <= 1000:
                raise ValueError("Use an array containing 1–1000 destinations.")
            validated = [
                (r["id"], validate_record(r))
                for r in records
                if isinstance(r, dict) and "id" in r
            ]
            if len(validated) != len(records) or len(
                {slug for slug, _ in validated}
            ) != len(records):
                raise ValueError("Every record needs a unique ID.")
        except (OSError, ValueError, TypeError) as error:
            raise CommandError(str(error)) from error
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Validated {len(validated)} destinations; no data changed."
                )
            )
            return
        created = changed = 0
        # Validate the entire file before writing. Repeat runs are safe if a write is interrupted.
        for slug, fields in validated:
            if update:
                _, added = Destination.objects.update_or_create(
                    slug=slug, defaults=fields
                )
                changed += not added
            else:
                _, added = Destination.objects.get_or_create(slug=slug, defaults=fields)
            created += added
        self.stdout.write(
            self.style.SUCCESS(
                f"Catalogue: {created} added, {changed} updated, {len(validated) - created - changed} preserved."
            )
        )
