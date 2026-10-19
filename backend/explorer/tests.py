import hashlib
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
from contextlib import closing
from datetime import timedelta
from io import StringIO
from pathlib import Path
from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import Client, SimpleTestCase, TransactionTestCase, override_settings
from django.utils import timezone

from .models import ContactMessage, Destination, RateWindow, SavedPlace, Session, User


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class ApiTests(TransactionTestCase):
    @override_settings(
        REQUIRE_BACKEND_PROXY_TOKEN=True,
        BACKEND_PROXY_TOKEN="private-service-token-for-tests-only",
    )
    def test_hosted_backend_requires_authenticated_frontend(self):
        for token in (None, "invalid", "not-ascii-\u00e9"):
            headers = {"HTTP_X_DISCOVERHUB_PROXY_TOKEN": token} if token else {}
            response = self.client.get("/api/health", **headers)
            self.assertEqual(response.status_code, 403)
            self.assertEqual(response["Cache-Control"], "no-store")
        response = self.client.get(
            "/api/health",
            HTTP_X_DISCOVERHUB_PROXY_TOKEN="private-service-token-for-tests-only",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["database"], "mongodb")

    def post(self, path, data, **headers):
        return self.client.post(
            path, json.dumps(data), content_type="application/json", **headers
        )

    def register(self):
        return self.post(
            "/api/auth/register",
            {
                "name": "Explorer",
                "email": "EXPLORER@example.com",
                "password": "a-secure-password",
            },
        )

    def test_registration_persists_hashed_password_and_session(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="explorer@example.com")
        self.assertTrue(user.password.startswith("pbkdf2_sha256$"))
        self.assertEqual(response.json()["user"]["id"], str(user.pk))
        self.assertNotEqual(
            Session.objects.get().token_hash, response.cookies["dh_session"].value
        )
        self.assertTrue(response.cookies["dh_session"]["httponly"])
        self.assertEqual(
            self.client.get("/api/auth/me").json()["user"]["email"], user.email
        )
        self.assertEqual(self.register().status_code, 409)
        self.assertEqual(self.post("/api/auth/logout", {}).status_code, 200)
        self.assertEqual(Session.objects.count(), 0)
        self.assertIsNone(self.client.get("/api/auth/me").json()["user"])

    def test_expired_sessions_cannot_authenticate_before_ttl_cleanup(self):
        self.register()
        Session.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        self.assertIsNone(self.client.get("/api/auth/me").json()["user"])

    @override_settings(BACKEND_PROXY_TOKEN="test-proxy-token")
    def test_validation_origins_and_shared_request_limits(self):
        self.assertEqual(
            self.post(
                "/api/contact", {}, HTTP_ORIGIN="https://other.example"
            ).status_code,
            403,
        )
        self.assertEqual(self.post("/api/contact", []).status_code, 400)
        self.assertEqual(
            self.client.post(
                "/api/contact", "invalid", content_type="application/json"
            ).status_code,
            400,
        )
        self.assertEqual(self.client.get("/api/contact").status_code, 405)
        RateWindow.objects.all().delete()
        data = {
            "name": "Explorer",
            "email": "hi@example.com",
            "message": "Please tell me about the destination.",
        }
        for _ in range(5):
            self.assertEqual(self.post("/api/contact", data).status_code, 201)
        response = self.post(
            "/api/contact",
            data,
            HTTP_X_FORWARDED_FOR="another-client",
            HTTP_X_DISCOVERHUB_PROXY_TOKEN="wrong-token",
            HTTP_X_DISCOVERHUB_CLIENT_IP="192.0.2.1",
        )
        self.assertEqual(response.status_code, 429)
        self.assertIn("Retry-After", response)
        self.assertEqual(ContactMessage.objects.count(), 5)
        self.assertEqual(
            self.post(
                "/api/contact",
                data,
                HTTP_X_DISCOVERHUB_PROXY_TOKEN="test-proxy-token",
                HTTP_X_DISCOVERHUB_CLIENT_IP="192.0.2.1",
            ).status_code,
            201,
        )

    @override_settings(FOURSQUARE_API_KEY="test-key")
    def test_nearby_provider_mapping_and_unavailable_response(self):
        with patch("explorer.views.urlopen") as urlopen:
            urlopen.return_value.__enter__.return_value.read.return_value = json.dumps(
                {
                    "results": [
                        {
                            "fsq_place_id": "a-place",
                            "name": "A garden",
                            "latitude": 51.5,
                            "longitude": -0.1,
                            "categories": [{"name": "Park"}],
                        },
                        {
                            "fsq_place_id": "invalid",
                            "name": "Bad coordinates",
                            "latitude": 100,
                            "longitude": 0,
                        },
                    ]
                }
            ).encode()
            response = self.client.get("/api/places?lat=51.5&lng=-0.1")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.json()["places"]), 1)
            self.assertEqual(response.json()["places"][0]["category"], "Park")
            request = urlopen.call_args.args[0]
            self.assertEqual(request.get_header("Authorization"), "Bearer test-key")
            urlopen.side_effect = TimeoutError()
            self.assertEqual(
                self.client.get("/api/places?lat=51.5&lng=-0.1").status_code, 502
            )

    def test_sqlite_import_is_repeatable_and_upgrades_existing_passwords(self):
        password = "a-legacy-password"
        salt = "1234567890abcdef1234567890abcdef"
        hashed = hashlib.scrypt(
            password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64
        ).hex()
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "legacy.sqlite"
            with closing(sqlite3.connect(source)) as connection:
                connection.executescript(
                    "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password_hash TEXT, created_at TEXT); CREATE TABLE messages (id INTEGER PRIMARY KEY, name TEXT, email TEXT, message TEXT, created_at TEXT); CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER, expires_at INTEGER);"
                )
                connection.execute(
                    "INSERT INTO users VALUES (1, 'Legacy Explorer', 'legacy@example.com', ?, '2023-08-28 12:00:00')",
                    [f"{salt}:{hashed}"],
                )
                connection.execute(
                    "INSERT INTO messages VALUES (1, 'Visitor', 'visitor@example.com', 'A previous contact message.', '2023-08-28 12:00:00')"
                )
                connection.execute(
                    "INSERT INTO sessions VALUES (?, 1, ?)",
                    [
                        hashlib.sha256(("a" * 64).encode()).hexdigest(),
                        int((timezone.now() + timedelta(days=1)).timestamp() * 1000),
                    ],
                )
                connection.commit()
            original = source.read_bytes()
            for _ in range(2):
                call_command("import_sqlite", str(source), stdout=StringIO())
            self.assertEqual(source.read_bytes(), original)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertEqual(Session.objects.count(), 1)
        self.client.cookies["dh_session"] = "a" * 64
        self.assertEqual(
            self.client.get("/api/auth/me").json()["user"]["email"],
            "legacy@example.com",
        )
        response = self.post(
            "/api/auth/login", {"email": "legacy@example.com", "password": password}
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.get().password.startswith("pbkdf2_sha256$"))


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class CatalogueTests(TransactionTestCase):
    def setUp(self):
        self.source = Path(__file__).parent / "fixtures" / "destinations.json"
        call_command("import_destinations", self.source, stdout=StringIO())

    def post(self, path, data, client=None):
        return (client or self.client).post(
            path, json.dumps(data), content_type="application/json"
        )

    def register(self, email, client=None):
        response = self.post(
            "/api/auth/register",
            {"name": "Explorer", "email": email, "password": "a-secure-password"},
            client,
        )
        self.assertEqual(response.status_code, 201)
        return response.json()["user"]["id"]

    def test_catalogue_search_filters_pagination_and_dynamic_metadata(self):
        first = self.client.get("/api/destinations?limit=2").json()
        self.assertEqual(first["total"], 4)
        self.assertEqual(
            [p["id"] for p in first["destinations"]], ["lake-braies", "lake-garda"]
        )
        focused = self.post(
            "/api/destinations", {"limit": 2, "focus": "cappadocia"}
        ).json()
        self.assertEqual(focused["offset"], 2)
        self.assertEqual(focused["destinations"][-1]["id"], "cappadocia")
        self.assertEqual(
            self.post("/api/destinations", {"q": "ITALY"}).json()["total"], 2
        )
        self.assertEqual(self.post("/api/destinations", {"q": ".*"}).json()["total"], 0)
        self.assertEqual(
            self.client.get("/api/destinations?category=Coast").json()["total"], 1
        )
        Destination.objects.filter(slug="lake-garda").update(
            name="Updated from MongoDB", category="Lakes"
        )
        response = self.client.get("/api/destinations").json()
        self.assertIn("Lakes", response["categories"])
        self.assertEqual(response["destinations"][1]["name"], "Updated from MongoDB")
        Destination.objects.filter(slug="lake-garda").update(published=False)
        self.assertEqual(
            self.client.get("/api/destinations/lake-garda").status_code, 404
        )
        self.assertEqual(self.client.get("/api/destinations").json()["total"], 3)
        self.assertEqual(
            self.client.get("/api/destinations/missing-place").status_code, 404
        )
        self.assertEqual(
            self.post("/api/destinations/lake-braies", {}).status_code, 405
        )

    def test_invalid_filters_are_rejected_and_guest_ids_are_bounded(self):
        for data in (
            {"limit": 51},
            {"limit": 1.5},
            {"offset": -1},
            {"q": []},
            {"q": "x" * 101},
            {"focus": "../escape"},
            {"category": "Saved", "ids": ["x"] * 201},
            {"category": "Saved", "ids": "lake-braies"},
        ):
            self.assertEqual(
                self.post("/api/destinations", data).status_code, 400, data
            )
        result = self.post(
            "/api/destinations",
            {"category": "Saved", "ids": ["lake-braies", "missing"]},
        ).json()
        self.assertEqual(result["total"], 1)
        self.assertEqual(self.client.get("/api/saved").status_code, 401)
        self.assertEqual(
            self.post("/api/saved", {"id": "lake-braies", "saved": True}).status_code,
            401,
        )

    def test_saves_are_idempotent_scoped_to_accounts_and_survive_new_sessions(self):
        owner = self.register("one@example.com")
        payload = {"id": "lake-braies", "saved": True, "accountId": owner}
        for _ in range(2):
            self.assertEqual(self.post("/api/saved", payload).status_code, 200)
        self.assertEqual(SavedPlace.objects.count(), 1)
        other = Client()
        other_id = self.register("two@example.com", other)
        self.assertEqual(other.get("/api/saved").json()["saved"], [])
        self.assertEqual(
            self.post(
                "/api/destinations", {"category": "Saved", "accountId": owner}, other
            ).status_code,
            409,
        )
        self.assertEqual(self.post("/api/saved", payload, other).status_code, 409)
        self.assertEqual(
            self.post(
                "/api/destinations",
                {"category": "Saved", "ids": ["lake-braies"]},
                other,
            ).json()["total"],
            0,
        )
        second_device = Client()
        login = self.post(
            "/api/auth/login",
            {"email": "one@example.com", "password": "a-secure-password"},
            second_device,
        )
        self.assertEqual(login.json()["saved"], ["lake-braies"])
        self.assertEqual(
            second_device.get("/api/auth/me").json()["saved"], ["lake-braies"]
        )
        self.assertEqual(
            self.post(
                "/api/saved", {**payload, "saved": False}, second_device
            ).status_code,
            200,
        )
        self.assertEqual(self.client.get("/api/saved").json()["saved"], [])
        self.assertEqual(
            self.post(
                "/api/saved",
                {"id": "missing", "saved": True, "accountId": other_id},
                other,
            ).status_code,
            404,
        )

    def test_explicit_guest_import_merges_only_published_places(self):
        owner = self.register("import@example.com")
        Destination.objects.filter(slug="lake-garda").update(published=False)
        payload = {
            "accountId": owner,
            "ids": ["lake-braies", "lake-braies", "lake-garda", "missing"],
        }
        for _ in range(2):
            response = self.post("/api/saved/import", payload)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["accepted"], ["lake-braies"])
        self.assertEqual(SavedPlace.objects.count(), 1)
        Destination.objects.filter(slug="lake-braies").update(published=False)
        self.assertEqual(self.client.get("/api/auth/me").json()["saved"], [])
        self.assertEqual(SavedPlace.objects.count(), 1)
        self.assertEqual(
            self.post(
                "/api/saved/import", {"accountId": owner, "ids": ["../bad"]}
            ).status_code,
            400,
        )

    def test_operator_import_validates_before_writes_and_preserves_edits_on_startup(
        self,
    ):
        records = json.loads(self.source.read_text(encoding="utf-8"))
        Destination.objects.filter(slug="lake-braies").update(
            name="Operator edit", published=False
        )
        call_command("import_destinations", self.source, stdout=StringIO())
        self.assertEqual(
            Destination.objects.get(slug="lake-braies").name, "Operator edit"
        )
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "destinations.json"
            record = {
                **records[0],
                "id": "new-place-2026",
                "name": "New place",
                "photoKey": "",
                "category": "Culture",
            }
            source.write_text(json.dumps([record]), encoding="utf-8")
            call_command("import_destinations", source, dry_run=True, stdout=StringIO())
            self.assertFalse(Destination.objects.filter(slug=record["id"]).exists())
            source.write_text(
                json.dumps([record, {**records[1], "latitude": 100}]), encoding="utf-8"
            )
            with self.assertRaises(CommandError):
                call_command("import_destinations", source, stdout=StringIO())
            self.assertFalse(Destination.objects.filter(slug=record["id"]).exists())
            source.write_text(json.dumps([record]), encoding="utf-8")
            call_command("import_destinations", source, stdout=StringIO())
            detail = self.client.get("/api/destinations/new-place-2026")
            self.assertEqual(detail.status_code, 200)
            self.assertEqual(detail.json()["destination"]["photoKey"], "")
            source.write_text(
                json.dumps([{**record, "name": "Changed name"}]), encoding="utf-8"
            )
            call_command("import_destinations", source, update=True, stdout=StringIO())
            self.assertEqual(
                Destination.objects.get(slug=record["id"]).name, "Changed name"
            )


class ProductionSettingsTests(SimpleTestCase):
    def test_vercel_settings_fail_closed_without_hosted_configuration(self):
        env = {
            **os.environ,
            "VERCEL": "1",
            "DJANGO_DEBUG": "false",
            "DJANGO_SECRET_KEY": "s" * 64,
            "BACKEND_PROXY_TOKEN": "p" * 64,
            "MONGODB_URI": "mongodb+srv://example.invalid/",
            "MONGODB_DATABASE": "discoverhub_preview",
            "FRONTEND_ORIGINS": "https://frontend.example",
            "VERCEL_URL": "backend-deployment.vercel.app",
            "VERCEL_PROJECT_PRODUCTION_URL": "backend.vercel.app",
            "DJANGO_ALLOWED_HOSTS": "",
            "DJANGO_COOKIE_SECURE": "false",
        }
        code = "from config import settings; assert not settings.DEBUG; assert settings.REQUIRE_BACKEND_PROXY_TOKEN; assert settings.SESSION_COOKIE_SECURE; assert 'backend.vercel.app' in settings.ALLOWED_HOSTS; assert 'localhost' not in settings.ALLOWED_HOSTS"
        folder = Path(__file__).resolve().parents[1]
        result = subprocess.run(
            [sys.executable, "-c", code],
            cwd=folder,
            env=env,
            capture_output=True,
            timeout=15,
        )
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        for field, value in (
            ("BACKEND_PROXY_TOKEN", ""),
            ("MONGODB_URI", ""),
            ("DJANGO_SECRET_KEY", "short"),
            ("DJANGO_DEBUG", "true"),
            ("FRONTEND_ORIGINS", ""),
        ):
            result = subprocess.run(
                [sys.executable, "-c", "import config.settings"],
                cwd=folder,
                env={**env, field: value},
                capture_output=True,
                timeout=15,
            )
            self.assertNotEqual(result.returncode, 0, field)
