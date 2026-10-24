"""TC-Personal-01 (OTT-F-030): add or remove a title from the personal watchlist."""
from app.routers.watchlist import router


def test_add_title_to_watchlist(make_client):
    client = make_client(router)
    response = client.post("/watchlist/1")
    assert response.status_code == 200
    assert response.json() == {"title_id": 1, "in_watchlist": True}

    items = client.get("/watchlist").json()
    assert [item["title_id"] for item in items] == [1]
    assert items[0]["title"] == "Movie One"


def test_adding_twice_keeps_one_entry(make_client):
    client = make_client(router)
    client.post("/watchlist/1")
    client.post("/watchlist/1")
    assert len(client.get("/watchlist").json()) == 1


def test_remove_title_from_watchlist(make_client):
    client = make_client(router)
    client.post("/watchlist/1")
    client.post("/watchlist/2")

    response = client.delete("/watchlist/1")
    assert response.json() == {"title_id": 1, "in_watchlist": False}
    assert [item["title_id"] for item in client.get("/watchlist").json()] == [2]


def test_removing_title_not_in_list_is_harmless(make_client):
    assert make_client(router).delete("/watchlist/1").status_code == 200


def test_watchlist_is_private_to_each_user(make_client):
    make_client(router, user_id=1).post("/watchlist/1")
    assert make_client(router, user_id=2).get("/watchlist").json() == []


def test_unknown_title_cannot_be_added(make_client):
    assert make_client(router).post("/watchlist/999").status_code == 404


def test_requires_login(make_client):
    client = make_client(router, user_id=None)
    assert client.get("/watchlist").status_code == 401
    assert client.post("/watchlist/1").status_code == 401
    assert client.delete("/watchlist/1").status_code == 401
