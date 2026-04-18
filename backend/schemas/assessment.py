from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AssessmentResponse(BaseModel):
    id: UUID
    assessment_type: str
    predicted_condition: str
    confidence_score: float
    urgency_level: str
    symptoms: list[str]
    created_at: datetime
