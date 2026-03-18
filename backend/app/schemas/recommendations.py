from pydantic import BaseModel
from typing import List


class GameRecommendation(BaseModel):
    app_id: str
    title: str
    score: float


class RecommendationResponse(BaseModel):
    user_idx: int
    recommendations: List[GameRecommendation]
    total: int

