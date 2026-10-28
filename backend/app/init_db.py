import logging
from datetime import date, timedelta
from app.database import Base, engine, SessionLocal
import app.models  # registers all models
from app.models import Plan, User, Title, Subscription
from app.core.security import hash_password

logger = logging.getLogger(__name__)


def auto_init_and_seed() -> None:
    """Ensure database tables exist and default seed data is populated on startup."""
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            # 1. Seed plans if none exist
            if db.query(Plan).count() == 0:
                db.add_all([
                    Plan(id=1, name="Basic", price=199),
                    Plan(id=2, name="Premium", price=499),
                ])
                db.commit()

            # 2. Seed verified demo user if missing
            demo_user = db.query(User).filter(User.email == "demo@example.com").first()
            if not demo_user:
                demo_user = User(
                    full_name="Demo Viewer",
                    email="demo@example.com",
                    password_hash=hash_password("Demo@12345"),
                    is_verified=True,
                    is_admin=False,
                    role="viewer",
                )
                db.add(demo_user)
                db.commit()
                db.refresh(demo_user)

                sub = db.query(Subscription).filter(
                    Subscription.user_id == demo_user.id,
                    Subscription.status == "active",
                ).first()
                if not sub:
                    db.add(Subscription(
                        user_id=demo_user.id,
                        plan_id=1,
                        status="active",
                        start_date=date.today(),
                        expiry_date=date.today() + timedelta(days=90),
                    ))
                    db.commit()

            # 3. Seed admin user if missing
            admin_user = db.query(User).filter(User.email == "admin@streamhub.com").first()
            if not admin_user:
                db.add(User(
                    full_name="Admin Manager",
                    email="admin@streamhub.com",
                    password_hash=hash_password("Admin@12345"),
                    is_verified=True,
                    is_admin=True,
                    role="admin",
                ))
                db.commit()

            # 4. Seed catalog titles if none exist
            if db.query(Title).count() == 0:
                initial_titles = [
                    {"id": 1, "title": "The Dark Knight", "genre": "Action", "year": 2008, "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"},
                    {"id": 2, "title": "Mad Max: Fury Road", "genre": "Action", "year": 2015, "poster": "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg"},
                    {"id": 3, "title": "John Wick", "genre": "Action", "year": 2014, "poster": "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg"},
                    {"id": 4, "title": "The Hangover", "genre": "Comedy", "year": 2009, "poster": "https://image.tmdb.org/t/p/w500/uluhlXubGu1VxU63X9VHCLWDAYP.jpg"},
                    {"id": 5, "title": "Home Alone", "genre": "Comedy", "year": 1990, "poster": "https://image.tmdb.org/t/p/w500/onTSipZ8R3bliBdKfPtsDuHTdlL.jpg"},
                    {"id": 6, "title": "The Mask", "genre": "Comedy", "year": 1994, "poster": "https://image.tmdb.org/t/p/w500/8bsbX0N1U3G6Wkz2q9z3jvJ7kYf.jpg"},
                    {"id": 7, "title": "Inception", "genre": "Thriller", "year": 2010, "poster": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"},
                    {"id": 8, "title": "Shutter Island", "genre": "Thriller", "year": 2010, "poster": "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg"},
                    {"id": 9, "title": "Interstellar", "genre": "Sci-Fi", "year": 2014, "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"},
                    {"id": 10, "title": "The Martian", "genre": "Sci-Fi", "year": 2015, "poster": "https://image.tmdb.org/t/p/w500/5aGhaIH6nro2j5n9p8Zx6hG8nZC.jpg"},
                    {"id": 11, "title": "Titanic", "genre": "Romance", "year": 1997, "poster": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg"},
                    {"id": 12, "title": "The Notebook", "genre": "Romance", "year": 2004, "poster": "https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eW9zV.jpg"},
                    {"id": 13, "title": "The Conjuring", "genre": "Horror", "year": 2013, "poster": "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg"},
                    {"id": 14, "title": "A Quiet Place", "genre": "Horror", "year": 2018, "poster": "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg"},
                ]
                sample_video = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                for t_data in initial_titles:
                    db.add(Title(
                        id=t_data["id"],
                        title=t_data["title"],
                        genre=t_data["genre"],
                        year=t_data["year"],
                        poster_url=t_data["poster"],
                        video_url=sample_video,
                        synopsis=f"StreamHub streaming presentation of {t_data['title']}.",
                        is_published=True,
                    ))
                db.commit()

            logger.info("Database auto-check / seeding completed.")
        finally:
            db.close()
    except Exception as exc:
        logger.warning("Database auto-initialization skipped: %s", exc)


def initialize_database() -> None:
    auto_init_and_seed()


if __name__ == "__main__":
    initialize_database()
    print("Database tables created and seeded successfully.")
