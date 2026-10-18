import json
import logging
import math
from functools import wraps
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError
from django.http import JsonResponse

from .models import ContactMessage, Session, User
from .security import (
    current_user,
    password_matches,
    prepare,
    start_session,
    text,
    token_hash,
    upgrade_password,
    valid_email,
)

logger = logging.getLogger(__name__)


def api(methods, scope=None, limit=0):
    def decorate(view):
        @wraps(view)
        def wrapped(request, *args, **kwargs):
            try:
                response = prepare(request, methods, scope, limit)
                if response is None:
                    data = {}
                    if request.method == "POST":
                        try:
                            data = json.loads(request.body)
                        except (ValueError, UnicodeDecodeError):
                            return JsonResponse(
                                {"error": "Send valid JSON data."}, status=400
                            )
                        if not isinstance(data, dict):
                            return JsonResponse(
                                {"error": "Send a JSON object."}, status=400
                            )
                    response = view(request, data, *args, **kwargs)
            except Exception:
                logger.exception("API request failed")
                response = JsonResponse(
                    {"error": "We could not complete your request. Please try again."},
                    status=503,
                )
            response["Cache-Control"] = "no-store"
            return response

        return wrapped

    return decorate


@api(["GET"])
def health(request, data):
    User.objects.exists()
    return JsonResponse({"status": "ok", "backend": "django", "database": "mongodb"})


@api(["GET", "POST"])
def auth(request, data, action):
    if action not in {"me", "login", "register", "logout"}:
        return JsonResponse({"error": "Not found."}, status=404)
    failure = prepare(
        request,
        ["GET"] if action == "me" else ["POST"],
        "auth" if action in {"login", "register"} else None,
        12,
    )
    if failure is not None:
        return failure
    if action == "me":
        return JsonResponse({"user": current_user(request)})
    if action == "logout":
        Session.objects.filter(
            token_hash=token_hash(request.COOKIES.get("dh_session", ""))
        ).delete()
        response = JsonResponse({"user": None})
        response.set_cookie(
            "dh_session",
            "",
            max_age=0,
            httponly=True,
            samesite="Lax",
            secure=settings.SESSION_COOKIE_SECURE,
        )
        return response
    email = text(data.get("email")).lower()
    password = data.get("password", "")
    if (
        not valid_email(email)
        or not isinstance(password, str)
        or not 8 <= len(password) <= 128
    ):
        return JsonResponse(
            {"error": "Use a valid email and a password between 8 and 128 characters."},
            status=400,
        )
    if action == "register":
        name = text(data.get("name"))
        if not 2 <= len(name) <= 100:
            return JsonResponse(
                {"error": "Your name must be between 2 and 100 characters."}, status=400
            )
        hashed = make_password(password)
        try:
            user = User.objects.create(name=name, email=email, password=hashed)
        except IntegrityError:
            return JsonResponse(
                {"error": "An account with this email already exists. Try signing in."},
                status=409,
            )
    else:
        user = User.objects.filter(email=email).first()
        if user is None:
            make_password(
                password
            )  # Keep unknown-account work comparable to a password check.
        if user is None or not password_matches(password, user.password):
            return JsonResponse(
                {"error": "The email or password is incorrect."}, status=401
            )
        upgrade_password(user, password)
    response = JsonResponse(
        {"user": user.public()}, status=201 if action == "register" else 200
    )
    start_session(response, user)
    return response


@api(["POST"], "contact", 5)
def contact(request, data):
    name, email, message = (
        text(data.get("name")),
        text(data.get("email")),
        text(data.get("message")),
    )
    if (
        not 2 <= len(name) <= 100
        or not valid_email(email)
        or not 10 <= len(message) <= 5000
    ):
        return JsonResponse(
            {
                "error": "Add your name, a valid email, and a message between 10 and 5,000 characters."
            },
            status=400,
        )
    ContactMessage.objects.create(name=name, email=email, message=message)
    return JsonResponse(
        {"message": "Your message has been received. Thank you for getting in touch."},
        status=201,
    )


@api(["GET"], "places", 10)
def places(request, data):
    try:
        lat, lng = float(request.GET.get("lat", "")), float(request.GET.get("lng", ""))
        if (
            not math.isfinite(lat)
            or not math.isfinite(lng)
            or abs(lat) > 90
            or abs(lng) > 180
        ):
            raise ValueError()
    except ValueError:
        return JsonResponse(
            {"error": "Valid latitude and longitude are required."}, status=400
        )
    if not settings.FOURSQUARE_API_KEY:
        return JsonResponse(
            {
                "error": "Live nearby discovery is not connected yet. You can still explore our handpicked destinations.",
                "configured": False,
            },
            status=503,
        )
    params = urlencode(
        {
            "ll": f"{lat},{lng}",
            "radius": 10000,
            "limit": 20,
            "sort": "DISTANCE",
            "fields": "fsq_place_id,name,latitude,longitude,categories,location,distance",
        }
    )
    try:
        request = Request(
            f"https://places-api.foursquare.com/places/search?{params}",
            headers={
                "Authorization": f"Bearer {settings.FOURSQUARE_API_KEY}",
                "Accept": "application/json",
                "X-Places-Api-Version": "2025-06-17",
            },
        )
        with urlopen(request, timeout=10) as response:
            results = json.load(response)["results"]
        if not isinstance(results, list):
            raise ValueError()
        output = []
        for place in results:
            if not isinstance(place, dict):
                continue
            lat, lng = place.get("latitude"), place.get("longitude")
            if (
                not place.get("fsq_place_id")
                or not isinstance(place.get("name"), str)
                or not all(
                    type(n) in (int, float) and math.isfinite(n) for n in (lat, lng)
                )
                or abs(lat) > 90
                or abs(lng) > 180
            ):
                continue
            categories = place.get("categories") or [{}]
            location = place.get("location") or {}
            output.append(
                {
                    "id": place["fsq_place_id"],
                    "name": place["name"],
                    "latitude": lat,
                    "longitude": lng,
                    "category": categories[0].get("name", "Place"),
                    "address": location.get("formatted_address", ""),
                    "distance": place.get("distance"),
                }
            )
        return JsonResponse({"places": output})
    except (OSError, ValueError, KeyError, TypeError, AttributeError):
        logger.warning("Nearby provider request failed")
        return JsonResponse(
            {
                "error": "Nearby discovery is temporarily unavailable. Your map and handpicked destinations are still here."
            },
            status=502,
        )


def not_found(request, exception=None):
    return JsonResponse({"error": "Not found."}, status=404)
