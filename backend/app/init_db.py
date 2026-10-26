
from app.database import Base, engine
from app.models import User  # noqa: F401
from app.models.rating import Rating


def initialize_database() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    initialize_database()
    print("Database tables created successfully.")
