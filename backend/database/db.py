from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite keeps this demo lightweight. Swap with PostgreSQL URL for production.
DATABASE_URL = "sqlite:///./slingshot.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Yield a DB session for each request and close it safely."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
