
import logging
from datetime import date, timedelta

from app.database import Base, engine, SessionLocal
import app.models

from app.models import Plan, User, Title, Subscription
from app.core.security import hash_password


logger = logging.getLogger(__name__)


INITIAL_TITLES = [
    {
        "id": 1,
        "title": "The Dark Knight",
        "genre": "Action",
        "year": 2008,
        "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    },
    {
        "id": 2,
        "title": "Mad Max: Fury Road",
        "genre": "Action",
        "year": 2015,
        "poster": "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
    },
    {
        "id": 3,
        "title": "John Wick",
        "genre": "Action",
        "year": 2014,
        "poster": "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    },
    {
        "id": 4,
        "title": "The Hangover",
        "genre": "Comedy",
        "year": 2009,
        "poster": "https://image.tmdb.org/t/p/w500/uluhlXubGu1VxU63X9VHCLWDAYP.jpg",
    },
    {
        "id": 5,
        "title": "Home Alone",
        "genre": "Comedy",
        "year": 1990,
        "poster": "https://image.tmdb.org/t/p/w500/onTSipZ8R3bliBdKfPtsDuHTdlL.jpg",
    },
    {
        "id": 6,
        "title": "The Mask",
        "genre": "Comedy",
        "year": 1994,
        "poster": "https://image.tmdb.org/t/p/w500/8bsbX0N1U3G6Wkz2q9z3jvJ7kYf.jpg",
    },
    {
        "id": 7,
        "title": "Inception",
        "genre": "Thriller",
        "year": 2010,
        "poster": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    },
    {
        "id": 8,
        "title": "Shutter Island",
        "genre": "Thriller",
        "year": 2010,
        "poster": "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg",
    },
    {
        "id": 9,
        "title": "Interstellar",
        "genre": "Sci-Fi",
        "year": 2014,
        "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    },
    {
        "id": 10,
        "title": "The Martian",
        "genre": "Sci-Fi",
        "year": 2015,
        "poster": "https://image.tmdb.org/t/p/w500/5aGhaIH6nro2j5n9p8Zx6hG8nZC.jpg",
    },
    {
        "id": 11,
        "title": "Titanic",
        "genre": "Romance",
        "year": 1997,
        "poster": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    },
    {
        "id": 12,
        "title": "The Notebook",
        "genre": "Romance",
        "year": 2004,
        "poster": "https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eW9zV.jpg",
    },
    {
        "id": 13,
        "title": "The Conjuring",
        "genre": "Horror",
        "year": 2013,
        "poster": "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg",
    },
    {
        "id": 14,
        "title": "A Quiet Place",
        "genre": "Horror",
        "year": 2018,
        "poster": "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg",
    },
]

SAMPLE_VIDEO = (
    "https://interactive-examples.mdn.mozilla.net/"
    "media/cc0-videos/flower.mp4"
)
SAMPLE_TRAILER = (
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
)
SAMPLE_PREVIEW = (
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
)
SAMPLE_4K = (
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
)


def seed_plans(db):
    """Create default subscription plans if they do not exist."""

    plans = [
        (1, "Basic", 199, "1080p", 1, "Full HD streaming on 1 device"),
        (2, "Premium", 499, "4k", 4, "4K Ultra HD streaming on 4 devices, ad-free"),
    ]

    for plan_id, name, price, max_quality, device_limit, description in plans:
        existing = db.get(Plan, plan_id)

        if existing is None:
            db.add(
                Plan(
                    id=plan_id,
                    name=name,
                    price=price,
                    max_quality=max_quality,
                    device_limit=device_limit,
                    description=description,
                )
            )
        else:
            existing.price = price
            existing.max_quality = max_quality
            existing.device_limit = device_limit
            existing.description = description

    db.commit()


def seed_demo_user(db):
    """Create the demo viewer account if missing."""

    demo_user = (
        db.query(User)
        .filter(User.email == "demo@example.com")
        .first()
    )

    if demo_user is None:
        demo_user = User(
            full_name="Demo Viewer",
            email="demo@example.com",
            password_hash=hash_password("Demo@12345"),
            is_verified=True,
            is_admin=False,
            role="viewer",
            otp_attempts=0,
            reset_otp_attempts=0,
        )

        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    active_subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == demo_user.id,
            Subscription.status == "active",
            Subscription.expiry_date >= date.today(),
        )
        .first()
    )

    if active_subscription is None:
        db.add(
            Subscription(
                user_id=demo_user.id,
                plan_id=1,
                status="active",
                start_date=date.today(),
                expiry_date=date.today() + timedelta(days=90),
            )
        )
        db.commit()

    return demo_user


def seed_admin_user(db):
    """Create the admin account if missing."""

    admin_user = (
        db.query(User)
        .filter(User.email == "admin@streamhub.com")
        .first()
    )

    if admin_user is None:
        admin_user = User(
            full_name="Admin Manager",
            email="admin@streamhub.com",
            password_hash=hash_password("Admin@12345"),
            is_verified=True,
            is_admin=True,
            role="admin",
            otp_attempts=0,
            reset_otp_attempts=0,
        )

        db.add(admin_user)
        db.commit()

    return admin_user


def seed_catalog(db):
    """Insert missing sample movie records with trailers and previews."""

    for movie in INITIAL_TITLES:
        existing_title = db.get(Title, movie["id"])
        is_4k = movie["genre"] in ("Sci-Fi", "Action")
        max_q = "4k" if is_4k else "1080p"
        v_4k = SAMPLE_4K if is_4k else None

        if existing_title is not None:
            if not existing_title.trailer_url:
                existing_title.trailer_url = SAMPLE_TRAILER
            if not existing_title.preview_url:
                existing_title.preview_url = SAMPLE_PREVIEW
            if not existing_title.max_quality:
                existing_title.max_quality = max_q
            if is_4k and not existing_title.video_url_4k:
                existing_title.video_url_4k = v_4k
            continue

        db.add(
            Title(
                id=movie["id"],
                title=movie["title"],
                genre=movie["genre"],
                year=movie["year"],
                poster_url=movie["poster"],
                video_url=SAMPLE_VIDEO,
                trailer_url=SAMPLE_TRAILER,
                preview_url=SAMPLE_PREVIEW,
                video_url_4k=v_4k,
                max_quality=max_q,
                synopsis=(
                    f"StreamHub streaming presentation "
                    f"of {movie['title']}."
                ),
                is_published=True,
            )
        )

    db.commit()


def auto_init_and_seed() -> None:
    """Create missing tables and seed default StreamHub data."""

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        try:
            seed_plans(db)
            seed_demo_user(db)
            seed_admin_user(db)
            seed_catalog(db)

            logger.info(
                "StreamHub database initialization completed successfully."
            )

        except Exception:
            db.rollback()
            logger.exception(
                "StreamHub database initialization failed."
            )
            raise


def initialize_database() -> None:
    auto_init_and_seed()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_database()
    print("StreamHub database tables and seed data initialized successfully.")
