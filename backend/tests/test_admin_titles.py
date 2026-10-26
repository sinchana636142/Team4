"""Unit tests for OTT-F-050 (Upload titles and metadata) and OTT-F-051 (Publish and unpublish titles).
Verifies:
- Authorized administrator can create titles with metadata
- Metadata validation rejects invalid inputs (blank title, invalid year)
- Unauthorized viewers are rejected with 403
- Unauthenticated requests are rejected with 401
- Publishing and unpublishing operations
- Unpublished titles are excluded from public catalog
- Unpublished titles return 404 on playback endpoints
"""
import pytest
from app.models import Title, User
from app.routers.admin import router as admin_router
from app.routers.catalog import router as catalog_router
from app.routers.playback import router as playback_router


@pytest.fixture()
def admin_user(db):
    admin = User(
        id=99,
        full_name="Admin Content Manager",
        email="admin@streamhub.com",
        password_hash="x",
        is_verified=True,
        is_admin=True,
        role="admin",
    )
    db.add(admin)
    db.commit()
    return admin


def test_admin_create_title_success(make_client, db, admin_user):
    client = make_client(admin_router, user_id=admin_user.id)
    payload = {
        "title": "Interstellar Odyssey",
        "genre": "Sci-Fi",
        "year": 2024,
        "synopsis": "A team of explorers travel through a wormhole in space.",
        "poster_url": "https://cdn.example.com/posters/interstellar.jpg",
        "video_url": "https://cdn.example.com/videos/interstellar.mp4",
        "is_published": True,
    }
    response = client.post("/admin/titles", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Interstellar Odyssey"
    assert data["genre"] == "Sci-Fi"
    assert data["year"] == 2024
    assert data["is_published"] is True
    assert "id" in data


def test_admin_create_title_validation_errors(make_client, db, admin_user):
    client = make_client(admin_router, user_id=admin_user.id)

    # Empty title
    res_empty = client.post("/admin/titles", json={"title": "   ", "year": 2024})
    assert res_empty.status_code == 422

    # Invalid year (too early)
    res_year = client.post("/admin/titles", json={"title": "Valid Name", "year": 1700})
    assert res_year.status_code == 422


def test_ordinary_viewer_cannot_create_title(make_client, db):
    """Viewer (user_id=1) must receive 403 Forbidden."""
    client = make_client(admin_router, user_id=1)
    response = client.post("/admin/titles", json={"title": "Unauthorized Movie"})
    assert response.status_code == 403
    assert "administrator" in response.json()["detail"].lower()


def test_unauthenticated_cannot_create_title(make_client, db):
    client = make_client(admin_router, user_id=None)
    response = client.post("/admin/titles", json={"title": "No Auth Movie"})
    assert response.status_code == 401


def test_admin_publish_and_unpublish_title(make_client, db, admin_user):
    client = make_client(admin_router, user_id=admin_user.id)

    # Initially unpublished title
    t = Title(title="Secret Project", is_published=False)
    db.add(t)
    db.commit()
    db.refresh(t)

    # Publish
    pub_res = client.patch(f"/admin/titles/{t.id}/publish")
    assert pub_res.status_code == 200
    assert pub_res.json()["is_published"] is True

    # Check DB
    db.refresh(t)
    assert t.is_published is True

    # Unpublish
    unpub_res = client.patch(f"/admin/titles/{t.id}/unpublish")
    assert unpub_res.status_code == 200
    assert unpub_res.json()["is_published"] is False

    db.refresh(t)
    assert t.is_published is False


def test_publish_unpublish_missing_title_returns_404(make_client, db, admin_user):
    client = make_client(admin_router, user_id=admin_user.id)
    res = client.patch("/admin/titles/999999/publish")
    assert res.status_code == 404


def test_unpublished_title_excluded_from_public_catalog(make_client, db):
    client = make_client(catalog_router, user_id=1)

    # Create published and unpublished titles
    t_pub = Title(title="Visible Movie", genre="Action", is_published=True)
    t_unpub = Title(title="Hidden Vault Film", genre="Action", is_published=False)
    db.add_all([t_pub, t_unpub])
    db.commit()

    catalog_res = client.get("/catalog/titles")
    assert catalog_res.status_code == 200
    titles = catalog_res.json()
    title_names = [item["title"] for item in titles]

    assert "Visible Movie" in title_names
    assert "Hidden Vault Film" not in title_names

    # Direct detail access for unpublished title returns 404
    detail_res = client.get(f"/catalog/titles/{t_unpub.id}")
    assert detail_res.status_code == 404


def test_playback_rejects_unpublished_title(make_client, db):
    """Ordinary user playback endpoint must reject unpublished titles."""
    client = make_client(playback_router, user_id=1)
    t_hidden = Title(title="Unreleased Title", video_url="http://cdn/video.mp4", is_published=False)
    db.add(t_hidden)
    db.commit()

    res = client.get(f"/playback/{t_hidden.id}")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()
