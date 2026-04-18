import logging

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from backend.models.database import User, get_db
from backend.schemas.user import Token, UserCreate, UserLogin, UserResponse
from backend.utils.jwt import create_access_token, get_current_user


router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)) -> dict[str, str]:
    logger.info(
        "Register request payload: %s",
        {
            "full_name": user.full_name,
            "email": user.email,
            "age": user.age,
            "gender": user.gender,
            "location": user.location,
            "password": "***redacted***",
        },
    )
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        logger.warning("Registration blocked: duplicate email for %s", user.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    try:
        hashed_password = pwd_context.hash(user.password)
    except Exception as exc:
        logger.exception("Password hashing failed for %s", user.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to securely process the password right now.",
        ) from exc

    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        age=user.age,
        gender=user.gender,
        location=user.location,
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError as exc:
        db.rollback()
        logger.warning("Registration integrity error for %s: %s", user.email, exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Registration database error for %s", user.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create your account right now. Please try again shortly.",
        ) from exc
    except Exception as exc:
        db.rollback()
        logger.exception("Unexpected registration error for %s", user.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating your account.",
        ) from exc

    logger.info("User registered successfully for %s", user.email)
    return {"message": "User registered successfully"}


@router.post("/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)) -> Token:
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(db_user.id), "email": db_user.email}
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserResponse:
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile was not found.",
        )
    return current_user
