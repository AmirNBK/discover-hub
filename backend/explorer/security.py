import hashlib
import hmac
import ipaddress
import math
import re
import secrets
import time
from datetime import timedelta
from urllib.parse import urlsplit

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError
from django.db.models import F
from django.http import JsonResponse
from django.utils import timezone

from .models import RateWindow, Session


def text(value):
    return value.strip() if isinstance(value, str) else ""


def valid_email(value):
    return (
        len(value) <= 254
        and re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value) is not None
    )


def prepare(request, methods, scope=None, limit=0):
    if request.method not in methods:
        response = JsonResponse({"error": "Method not allowed."}, status=405)
        response["Allow"] = ", ".join(methods)
        return response
    if request.method == "POST":
        origin = request.headers.get("Origin")
        allowed = settings.FRONTEND_ORIGINS | {
            f"{request.scheme}://{request.get_host()}"
        }
        if origin and (origin not in allowed or urlsplit(origin).path):
            return JsonResponse(
                {"error": "This request must come from this website."}, status=403
            )
        if request.content_type != "application/json":
            return JsonResponse({"error": "Send JSON data."}, status=415)
    if scope:
        # Fixed windows are shared across Django workers. Only the authenticated
        # frontend service can supply a connection identity through its proxy.
        now = time.time()
        minute = int(now // 60)
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        if settings.BACKEND_PROXY_TOKEN and hmac.compare_digest(
            request.headers.get("X-DiscoverHub-Proxy-Token", ""),
            settings.BACKEND_PROXY_TOKEN,
        ):
            try:
                client_ip = str(
                    ipaddress.ip_address(
                        request.headers.get("X-DiscoverHub-Client-IP", "")
                    )
                )
            except ValueError:
                pass
        key = f"{scope}:{client_ip}:{minute}"
        try:
            window, _ = RateWindow.objects.get_or_create(
                key=key, defaults={"expires_at": timezone.now() + timedelta(minutes=2)}
            )
        except IntegrityError:
            window = RateWindow.objects.get(key=key)
        RateWindow.objects.filter(pk=window.pk).update(count=F("count") + 1)
        window.refresh_from_db()
        if window.count > limit:
            response = JsonResponse(
                {"error": "Too many requests. Please try again in a minute."},
                status=429,
            )
            response["Retry-After"] = str(math.ceil(60 - now % 60))
            return response
    return None


def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


def start_session(response, user):
    token = secrets.token_hex(32)
    Session.objects.create(
        token_hash=token_hash(token),
        user=user,
        expires_at=timezone.now() + timedelta(days=7),
    )
    response.set_cookie(
        "dh_session",
        token,
        max_age=7 * 86400,
        httponly=True,
        samesite="Lax",
        secure=settings.SESSION_COOKIE_SECURE,
    )


def current_account(request):
    token = request.COOKIES.get("dh_session", "")
    if not re.fullmatch(r"[a-f0-9]{64}", token):
        return None
    session = Session.objects.filter(
        token_hash=token_hash(token), expires_at__gt=timezone.now()
    ).first()
    return session.user if session else None


def current_user(request):
    account = current_account(request)
    return account.public() if account else None


def password_matches(password, stored):
    if stored.startswith("legacy_scrypt$"):
        try:
            _, salt, expected = stored.split("$")
            actual = hashlib.scrypt(
                password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64
            )
            return hmac.compare_digest(actual.hex(), expected)
        except (ValueError, TypeError):
            return False
    return check_password(password, stored)


def upgrade_password(user, password):
    if user.password.startswith("legacy_scrypt$"):
        user.password = make_password(password)
        user.save(update_fields=["password"])
