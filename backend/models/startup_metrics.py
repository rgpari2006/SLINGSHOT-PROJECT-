from sqlalchemy import Column, Float, Integer, String

from backend.database.db import Base


class StartupMetric(Base):
    __tablename__ = "startup_metrics"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, unique=True, nullable=False)
    revenue = Column(Float, nullable=False)
    retention = Column(Float, nullable=False)
    burn_rate = Column(Float, nullable=False)
    marketing_spend = Column(Float, nullable=False)
