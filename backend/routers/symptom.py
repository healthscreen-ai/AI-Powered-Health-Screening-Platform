import pickle
from functools import lru_cache
from pathlib import Path

import numpy as np
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, status

from backend.models.database import HealthAssessment, User, get_db
from backend.schemas.symptom import SymptomInput, SymptomResult
from backend.utils.jwt import get_current_user


router = APIRouter(prefix="/symptom", tags=["Symptom Checker"])

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "ml_models" / "symptom_model.pkl"
MLB_PATH = PROJECT_ROOT / "ml_models" / "mlb.pkl"

SPECIALIST_MAP = {
    "Flu": "General Physician",
    "Cardiac concern": "Cardiologist",
    "Migraine": "Neurologist",
    "Diabetes risk": "Endocrinologist",
    "Arthritis": "Rheumatologist",
    "Dermatitis": "Dermatologist",
    "IBS": "Gastroenterologist",
    "Common Cold": "General Physician",
    "Musculoskeletal": "Orthopedic Specialist",
    "Mental Health concern": "Mental Health Professional",
}


@lru_cache(maxsize=1)
def load_model_artifacts():
    if not MODEL_PATH.exists() or not MLB_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Symptom model artifacts are missing. Train the model first.",
        )

    with MODEL_PATH.open("rb") as model_file:
        model = pickle.load(model_file)

    with MLB_PATH.open("rb") as mlb_file:
        mlb = pickle.load(mlb_file)

    return model, mlb


def determine_urgency_level(confidence_score: float) -> str:
    if confidence_score >= 0.8:
        return "high"
    if confidence_score >= 0.55:
        return "medium"
    return "low"


@router.post("/analyze", response_model=SymptomResult)
def analyze_symptoms(
    payload: SymptomInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SymptomResult:
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user was not found.",
        )
    if not payload.symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one symptom is required.",
        )

    model, mlb = load_model_artifacts()

    normalized_symptoms = sorted({symptom.strip().lower() for symptom in payload.symptoms if symptom.strip()})
    if not normalized_symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symptoms cannot be empty strings.",
        )

    try:
        encoded_symptoms = mlb.transform([normalized_symptoms])
        predicted_condition = model.predict(encoded_symptoms)[0]
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to analyze the provided symptoms. Please review the symptom list and try again.",
        ) from exc

    if hasattr(model, "predict_proba"):
        try:
            probability_scores = model.predict_proba(encoded_symptoms)[0]
            confidence_score = float(np.max(probability_scores))
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Symptom analysis failed while calculating prediction confidence.",
            ) from exc
    else:
        confidence_score = 0.5

    urgency_level = determine_urgency_level(confidence_score)
    recommended_specialist = SPECIALIST_MAP.get(
        predicted_condition,
        "General Physician",
    )

    assessment = HealthAssessment(
        user_id=current_user.id,
        symptoms=normalized_symptoms,
        predicted_condition=predicted_condition,
        confidence_score=confidence_score,
        assessment_type="symptom",
        image_path=None,
    )
    try:
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save the symptom assessment right now.",
        ) from exc

    return SymptomResult(
        predicted_condition=predicted_condition,
        confidence_score=confidence_score,
        urgency_level=urgency_level,
        recommended_specialist=recommended_specialist,
    )
