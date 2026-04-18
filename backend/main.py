from fastapi import FastAPI

from models.database import Base, engine
from routers.assessments import router as assessments_router
from routers.auth import router as auth_router
from routers.image_diagnosis import router as image_router
from routers.symptom import router as symptom_router


app = FastAPI(
    title="AI-Powered Health Screening Platform API",
    description=(
        "Backend API for AI-assisted preliminary health screening workflows."
    ),
    version="0.1.0",
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(assessments_router)
app.include_router(image_router)
app.include_router(symptom_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "message": "Welcome to the AI-Powered Health Screening Platform backend."
    }
