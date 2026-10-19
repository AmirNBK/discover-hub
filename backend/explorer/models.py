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


class Destination(models.Model):
    slug = models.SlugField(max_length=80, unique=True)
    name = models.CharField(max_length=120)
    region = models.CharField(max_length=120)
    country = models.CharField(max_length=100)
    category = models.CharField(max_length=40)
    latitude = models.FloatField()
    longitude = models.FloatField()
    tagline = models.CharField(max_length=200)
    description = models.TextField(max_length=5000)
    highlights = models.JSONField(default=list)
    tip = models.TextField(max_length=1000)
    photo_key = models.CharField(max_length=80, blank=True)
    image_alt = models.CharField(max_length=300, blank=True)
    published = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=100)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "destinations"
        ordering = ["sort_order", "slug"]
        indexes = [models.Index(fields=["published", "sort_order", "slug"])]

    def public(self):
        return {
            "id": self.slug,
            "name": self.name,
            "region": self.region,
            "country": self.country,
            "category": self.category,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "tagline": self.tagline,
            "description": self.description,
            "highlights": self.highlights,
            "tip": self.tip,
            "photoKey": self.photo_key,
            "imageAlt": self.image_alt,
        }


class SavedPlace(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "saved_places"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "destination"], name="unique_user_destination"
            )
        ]
