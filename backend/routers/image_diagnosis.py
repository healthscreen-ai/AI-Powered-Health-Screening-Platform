import uuid
from functools import lru_cache
from pathlib import Path

import torch
from sqlalchemy.orm import Session
from torch import nn
from torchvision import models

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from models.database import HealthAssessment, User, get_db
from schemas.image import ImageResult
from utils.image_utils import preprocess_image, save_upload_file
from utils.jwt import get_current_user


router = APIRouter(prefix="/image", tags=["Image Diagnosis"])

PROJECT_ROOT = Path(__file__).resolve().parents[2]
UPLOADS_DIR = PROJECT_ROOT / "backend" / "uploads"
MODEL_PATH = PROJECT_ROOT / "ml_models" / "skin_model.pt"

CLASS_NAMES = [
    "Eczema",
    "Psoriasis",
    "Melanoma Risk",
    "Acne",
    "Normal Skin",
]

ADVICE_MAP = {
    "Eczema": "Consult a dermatologist for skin barrier and inflammation management.",
    "Psoriasis": "Consult a dermatologist for evaluation and flare control.",
    "Melanoma Risk": "Consult a dermatologist promptly for further assessment.",
    "Acne": "Consult a dermatologist if breakouts are severe or persistent.",
    "Normal Skin": "Maintain your current skincare routine and monitor any changes.",
}


def build_model() -> nn.Module:
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, len(CLASS_NAMES))
    return model


@lru_cache(maxsize=1)
def load_model() -> nn.Module:
    if not MODEL_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Skin model artifacts are missing. Train the model first.",
        )

    model = build_model()
    state_dict = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model


def determine_urgency_level(predicted_condition: str, confidence_score: float) -> str:
    if predicted_condition == "Melanoma Risk":
        return "high"
    if confidence_score >= 0.8:
        return "high"
    if confidence_score >= 0.55:
        return "medium"
    return "low"


@router.post("/analyze", response_model=ImageResult)
async def analyze_image(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ImageResult:
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user was not found.",
        )
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image.",
        )

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    file_suffix = Path(image.filename or "upload.jpg").suffix or ".jpg"
    saved_path = UPLOADS_DIR / f"{uuid.uuid4()}{file_suffix}"

    try:
        save_upload_file(image, saved_path)
        try:
            input_tensor = preprocess_image(saved_path)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file could not be processed as a valid image.",
            ) from exc
        model = load_model()

        with torch.no_grad():
            logits = model(input_tensor)
            probabilities = torch.softmax(logits, dim=1)
            confidence_score, predicted_index = torch.max(probabilities, dim=1)

        predicted_condition = CLASS_NAMES[predicted_index.item()]
        confidence = float(confidence_score.item())
        urgency_level = determine_urgency_level(predicted_condition, confidence)
        advice = ADVICE_MAP[predicted_condition]

        assessment = HealthAssessment(
            user_id=current_user.id,
            symptoms=[],
            predicted_condition=predicted_condition,
            confidence_score=confidence,
            assessment_type="image",
            image_path=str(saved_path),
        )
        try:
            db.add(assessment)
            db.commit()
            db.refresh(assessment)
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to save the image assessment right now.",
            ) from exc

        return ImageResult(
            predicted_condition=predicted_condition,
            confidence_score=confidence,
            urgency_level=urgency_level,
            advice=advice,
        )
    except HTTPException:
        if saved_path.exists():
            saved_path.unlink(missing_ok=True)
        raise
    except Exception:
        if saved_path.exists():
            saved_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Image analysis failed. Please try again with another image.",
        )
