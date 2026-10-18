import hashlib
import json
import sqlite3
import tempfile
from contextlib import closing
from datetime import timedelta
from io import StringIO
from pathlib import Path
from unittest.mock import patch

from django.core.management import call_command
from django.test import TransactionTestCase, override_settings
from django.utils import timezone

from .models import ContactMessage, RateWindow, Session, User


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class ApiTests(TransactionTestCase):
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
