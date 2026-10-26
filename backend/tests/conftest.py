"""Shared test fixtures for all backend tests."""
import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-that-is-long-enough-123456")

from tests.playback_features.conftest import db, make_client  # noqa: F401
