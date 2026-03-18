from fastapi import APIRouter, HTTPException, Query

from app.schemas.recommendations import GameRecommendation, RecommendationResponse
from app.services.data_store import DataStore


def build_router(store: DataStore) -> APIRouter:
    router = APIRouter(tags=["Recommendations"])

    @router.get(
        "/recommendations/{user_idx}",
        response_model=RecommendationResponse,
        summary="Recomendações personalizadas para um usuário",
    )
    def get_recommendations(
        user_idx: int,
        top_k: int = Query(default=10, ge=1, le=50, description="Número de recomendações"),
    ):
        try:
            df = store.load_recommendations()
        except FileNotFoundError as e:
            raise HTTPException(status_code=503, detail=str(e))

        user_df = df[df["user_idx"] == user_idx].sort_values("score", ascending=False).head(top_k)
        if user_df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Usuário {user_idx} não encontrado. Verifique se o índice está correto.",
            )

        recs = [
            GameRecommendation(
                app_id=str(row["app_id"]),
                title=str(row["title"]),
                score=round(float(row["score"]), 4),
            )
            for _, row in user_df.iterrows()
        ]

        return RecommendationResponse(user_idx=user_idx, recommendations=recs, total=len(recs))

    return router

