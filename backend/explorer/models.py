from django.db import models
from django.utils import timezone


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254, unique=True)
    password = models.CharField(max_length=256)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "users"

    def public(self):
        return {"id": str(self.pk), "name": self.name, "email": self.email}


class Session(models.Model):
    token_hash = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        db_table = "sessions"


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254)
    message = models.TextField(max_length=5000)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    # Allows repeatable SQLite imports without duplicating contact records.
    legacy_id = models.IntegerField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = "messages"


class RateWindow(models.Model):
    key = models.CharField(max_length=128, unique=True)
    count = models.IntegerField(default=0)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        db_table = "rate_windows"
