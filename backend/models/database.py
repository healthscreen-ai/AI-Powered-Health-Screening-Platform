import os
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, Column, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import declarative_base, relationship, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", "")
INVALID_DATABASE_URL_MESSAGE = (
    "DATABASE_URL is not configured. Please replace [YOUR-PASSWORD] with actual Supabase password."
)

engine = None
SessionLocal = sessionmaker(autocommit=False, autoflush=False)
Base = declarative_base()


def validate_database_url(database_url: str | None = None) -> str:
    url = database_url if database_url is not None else DATABASE_URL

    if not url:
        raise ValueError(
            "DATABASE_URL is not configured. Please set the environment variable before starting the backend."
        )

    if "[YOUR-PASSWORD]" in url:
        raise ValueError(INVALID_DATABASE_URL_MESSAGE)

    return url


def get_engine():
    global engine

    if engine is None:
        validated_url = validate_database_url()
        engine = create_engine(validated_url, pool_pre_ping=True)
        SessionLocal.configure(bind=engine)

    return engine


def initialize_database() -> None:
    current_engine = get_engine()
    Base.metadata.create_all(bind=current_engine)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    health_assessments = relationship(
        "HealthAssessment",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class HealthAssessment(Base):
    __tablename__ = "health_assessments"
    __table_args__ = (
        CheckConstraint(
            "assessment_type IN ('symptom', 'image')",
            name="ck_health_assessments_assessment_type",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symptoms = Column(ARRAY(Text), nullable=False, default=list)
    predicted_condition = Column(String(255), nullable=False)
    confidence_score = Column(Float, nullable=False)
    assessment_type = Column(String(20), nullable=False)
    image_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", back_populates="health_assessments")
    referrals = relationship(
        "Referral",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )


class Referral(Base):
    __tablename__ = "referrals"
    __table_args__ = (
        CheckConstraint(
            "urgency_level IN ('low', 'medium', 'high')",
            name="ck_referrals_urgency_level",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("health_assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    suggested_specialist = Column(String(255), nullable=False)
    urgency_level = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)

    assessment = relationship("HealthAssessment", back_populates="referrals")


def get_db():
    get_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
