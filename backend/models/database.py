import os
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, Column, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import declarative_base, relationship, sessionmaker


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/health_screening_platform",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


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
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
