"""Test setup for the playback / watchlist / subscription-status features.
Uses an in-memory SQLite database and a fake logged-in user, so no PostgreSQL is needed.
Run from the backend folder:  python -m pytest tests/playback_features
"""
import os

# must be set before the app is imported (app.core.config reads it)
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-that-is-long-enough-123456")

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import Title, User  # importing app.models registers every table
from app.routers.profile import get_current_user


@pytest.fixture()
def db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    for user_id in (1, 2):
        session.add(
            User(id=user_id, full_name=f"Viewer {user_id}", email=f"viewer{user_id}@test.com",
                 password_hash="x", is_verified=True)
        )
    session.add_all(
        [
            Title(id=1, title="Movie One", poster_url="http://img/1.jpg",
                  video_url="http://cdn/1.mp4", is_published=True),
            Title(id=2, title="Movie Two", poster_url="http://img/2.jpg",
                  video_url="http://cdn/2.mp4", is_published=True),
            Title(id=3, title="Hidden Movie", video_url="http://cdn/3.mp4", is_published=False),
        ]
    )
    session.commit()
    yield session
    session.close()


@pytest.fixture()
def make_client(db):
    """make_client(router, user_id=1)    -> client logged in as that user.
    make_client(router, user_id=None) -> client with NO login (the real 401 check runs)."""

    def _make(router, user_id=1):
        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[get_db] = lambda: db
        if user_id is not None:
            app.dependency_overrides[get_current_user] = lambda: db.get(User, user_id)
        return TestClient(app)

    return _make
