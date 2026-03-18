from fastapi import APIRouter, HTTPException

from app.services.data_store import DataStore


def build_router(store: DataStore) -> APIRouter:
    router = APIRouter(tags=["Stats"])

    @router.get("/stats", summary="Estatísticas gerais do dataset")
    def get_stats():
        try:
            df = store.load_recommendations()
        except FileNotFoundError as e:
            raise HTTPException(status_code=503, detail=str(e))

        return {
            "total_interactions": int(len(df)),
            "unique_users": int(df["user_idx"].nunique()),
            "unique_games": int(df["app_id"].nunique()),
            "avg_score": round(float(df["score"].mean()), 4),
            "model": "ALS Collaborative Filtering (Spark MLlib)",
            "mlflow_registry": "steam_als_recommender @ Production",
        }

    return router

