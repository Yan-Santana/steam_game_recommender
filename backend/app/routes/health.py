from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def root():
    return {"status": "ok", "service": "Steam Game Recommender API v1.0"}


@router.get("/health")
def health():
    return {"status": "healthy"}

