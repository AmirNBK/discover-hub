import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ON_VERCEL = os.environ.get("VERCEL") == "1"
if not ON_VERCEL:
    load_dotenv(BASE_DIR.parent / ".env.local")

DEBUG = os.environ.get("DJANGO_DEBUG", str(not ON_VERCEL)).lower() == "true"
BACKEND_PROXY_TOKEN = os.environ.get("BACKEND_PROXY_TOKEN", "")
REQUIRE_BACKEND_PROXY_TOKEN = (
    ON_VERCEL
    or os.environ.get("REQUIRE_BACKEND_PROXY_TOKEN", "false").lower() == "true"
)
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "local-development-only")
if not DEBUG and SECRET_KEY == "local-development-only":
    raise RuntimeError("Set DJANGO_SECRET_KEY before running outside development.")
if ON_VERCEL:
    if DEBUG or len(SECRET_KEY) < 50:
        raise RuntimeError(
            "Vercel requires debug disabled and a random DJANGO_SECRET_KEY of at least 50 characters."
        )
    if not os.environ.get("MONGODB_URI") or not os.environ.get("MONGODB_DATABASE"):
        raise RuntimeError(
            "Configure the hosted MongoDB URI and database before deploying."
        )
    if not os.environ.get("FRONTEND_ORIGINS"):
        raise RuntimeError(
            "Configure the exact frontend HTTPS origins before deploying."
        )
if REQUIRE_BACKEND_PROXY_TOKEN and len(BACKEND_PROXY_TOKEN) < 32:
    raise RuntimeError(
        "Set a random shared BACKEND_PROXY_TOKEN of at least 32 characters."
    )
ALLOWED_HOSTS = os.environ.get(
    "DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,testserver"
).split(",")
if ON_VERCEL:
    ALLOWED_HOSTS = [
        host.strip()
        for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",")
        if host.strip()
    ]
    for variable in (
        "VERCEL_URL",
        "VERCEL_PROJECT_PRODUCTION_URL",
        "VERCEL_BRANCH_URL",
    ):
        host = os.environ.get(variable)
        if host and host not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(host)
FRONTEND_ORIGINS = set(
    os.environ.get(
        "FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:3100"
    ).split(",")
)
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
INSTALLED_APPS = ["explorer.apps.ExplorerConfig"]
DEFAULT_AUTO_FIELD = "django_mongodb_backend.fields.ObjectIdAutoField"
DATABASES = {
    "default": {
        "ENGINE": "django_mongodb_backend",
        "HOST": os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27018"),
        "NAME": os.environ.get("MONGODB_DATABASE", "discoverhub"),
        "OPTIONS": {
            "serverSelectionTimeoutMS": 5000,
            "connectTimeoutMS": 5000,
            "maxPoolSize": 10,
            "minPoolSize": 0,
            "maxIdleTimeMS": 60000,
        },
    }
}
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "explorer.middleware.BackendProxyMiddleware",
]
USE_TZ = True
TIME_ZONE = "UTC"
APPEND_SLASH = False
DATA_UPLOAD_MAX_MEMORY_SIZE = 32768
SESSION_COOKIE_SECURE = (
    ON_VERCEL
    or os.environ.get("DJANGO_COOKIE_SECURE", str(not DEBUG)).lower() == "true"
)
PASSWORD_HASHERS = ["django.contrib.auth.hashers.PBKDF2PasswordHasher"]
FOURSQUARE_API_KEY = os.environ.get("FOURSQUARE_API_KEY", "")
