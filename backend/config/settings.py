import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env.local")

DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() == "true"
BACKEND_PROXY_TOKEN = os.environ.get("BACKEND_PROXY_TOKEN", "")
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "local-development-only")
if not DEBUG and SECRET_KEY == "local-development-only":
    raise RuntimeError("Set DJANGO_SECRET_KEY before running outside development.")
ALLOWED_HOSTS = os.environ.get(
    "DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,testserver"
).split(",")
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
        "OPTIONS": {"serverSelectionTimeoutMS": 5000, "connectTimeoutMS": 5000},
    }
}
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware"]
USE_TZ = True
TIME_ZONE = "UTC"
APPEND_SLASH = False
DATA_UPLOAD_MAX_MEMORY_SIZE = 32768
SESSION_COOKIE_SECURE = (
    os.environ.get("DJANGO_COOKIE_SECURE", str(not DEBUG)).lower() == "true"
)
PASSWORD_HASHERS = ["django.contrib.auth.hashers.PBKDF2PasswordHasher"]
FOURSQUARE_API_KEY = os.environ.get("FOURSQUARE_API_KEY", "")
