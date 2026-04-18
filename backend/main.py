import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.models.database import initialize_database
from backend.routers.assessments import router as assessments_router
from backend.routers.auth import router as auth_router
from backend.routers.image_diagnosis import router as image_router
from backend.routers.symptom import router as symptom_router


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        initialize_database()
    except ValueError as exc:
        logger.error(str(exc))
        raise RuntimeError(str(exc)) from exc

    logger.info("DB initialized successfully")

    yield


app = FastAPI(
    title="AI-Powered Health Screening Platform API",
    description=(
        "Backend API for AI-assisted preliminary health screening workflows."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(assessments_router)
app.include_router(image_router)
app.include_router(symptom_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "message": "Welcome to the AI-Powered Health Screening Platform backend."
    }
