from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, status

from models.database import HealthAssessment, User, get_db
from schemas.assessment import AssessmentResponse
from utils.jwt import get_current_user


router = APIRouter(prefix="/assessments", tags=["Assessments"])


def determine_urgency_level(predicted_condition: str, confidence_score: float) -> str:
    if predicted_condition == "Melanoma Risk":
        return "high"
    if confidence_score >= 0.8:
        return "high"
    if confidence_score >= 0.55:
        return "medium"
    return "low"


@router.get("/history", response_model=list[AssessmentResponse])
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AssessmentResponse]:
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user was not found.",
        )

    try:
        assessments = (
            db.query(HealthAssessment)
            .filter(HealthAssessment.user_id == current_user.id)
            .order_by(HealthAssessment.created_at.desc())
            .all()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load assessment history right now.",
        ) from exc

    return [
        AssessmentResponse(
            id=assessment.id,
            assessment_type=assessment.assessment_type,
            predicted_condition=assessment.predicted_condition,
            confidence_score=assessment.confidence_score,
            urgency_level=determine_urgency_level(
                assessment.predicted_condition,
                assessment.confidence_score,
            ),
            symptoms=assessment.symptoms,
            created_at=assessment.created_at,
        )
        for assessment in assessments
    ]
