"""Catalogue validation shared by operator imports and public queries."""

import math
import re

SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
PHOTO_KEYS = {"", "lake-braies", "lake-garda", "koh-lipe", "cappadocia"}


def valid_slug(value):
    return isinstance(value, str) and len(value) <= 80 and SLUG.fullmatch(value)


def validate_ids(value):
    if (
        not isinstance(value, list)
        or len(value) > 200
        or not all(valid_slug(v) for v in value)
    ):
        raise ValueError("Use a list of at most 200 destination IDs.")
    return list(dict.fromkeys(value))


def validate_record(record):
    if not isinstance(record, dict) or not valid_slug(record.get("id")):
        raise ValueError(
            "Each destination needs a lowercase, hyphen-separated ID (maximum 80 characters)."
        )
    fields = {
        "name": ("name", 120),
        "region": ("region", 120),
        "country": ("country", 100),
        "category": ("category", 40),
        "tagline": ("tagline", 200),
        "description": ("description", 5000),
        "tip": ("tip", 1000),
        "imageAlt": ("image_alt", 300),
    }
    allowed = set(fields) | {
        "id",
        "latitude",
        "longitude",
        "photoKey",
        "highlights",
        "published",
        "sortOrder",
    }
    if set(record) - allowed:
        raise ValueError(
            f"Unknown destination fields: {', '.join(sorted(set(record) - allowed))}"
        )
    output = {}
    for key, (field, maximum) in fields.items():
        value = record.get(key, "")
        if (
            not isinstance(value, str)
            or len(value.strip()) > maximum
            or (key != "imageAlt" and not value.strip())
        ):
            raise ValueError(f"{key} must contain 1–{maximum} characters.")
        output[field] = value.strip()
    if output["category"] in {"All places", "Saved", "Nearby"}:
        raise ValueError("That category name is reserved for filters.")
    for field, bound in (("latitude", 90), ("longitude", 180)):
        value = record.get(field)
        if (
            type(value) not in (int, float)
            or not math.isfinite(value)
            or abs(value) > bound
        ):
            raise ValueError(f"{field} must be a finite coordinate within ±{bound}.")
        output[field] = value
    highlights = record.get("highlights")
    if (
        not isinstance(highlights, list)
        or not 1 <= len(highlights) <= 12
        or not all(
            isinstance(v, str) and 1 <= len(v.strip()) <= 200 for v in highlights
        )
    ):
        raise ValueError("Use 1–12 highlights, each containing 1–200 characters.")
    photo = record.get("photoKey", "")
    if not isinstance(photo, str) or photo not in PHOTO_KEYS:
        raise ValueError(
            "photoKey must reference an installed licensed photo, or be empty for a placeholder."
        )
    if photo and (photo != record["id"] or not output["image_alt"]):
        raise ValueError(
            "A photo must belong to this destination and include alternative text."
        )
    published, order = record.get("published", True), record.get("sortOrder", 100)
    if (
        type(published) is not bool
        or type(order) is not int
        or not 0 <= order <= 1000000
    ):
        raise ValueError(
            "published must be boolean; sortOrder must be an integer from 0 to 1000000."
        )
    return {
        **output,
        "highlights": [v.strip() for v in highlights],
        "photo_key": photo,
        "published": published,
        "sort_order": order,
    }
