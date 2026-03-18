from fastapi import APIRouter, HTTPException, Query

from app.services.data_store import DataStore


def build_router(store: DataStore) -> APIRouter:
    router = APIRouter(tags=["Users"])

    @router.get("/users", summary="Lista usuários disponíveis")
    def list_users(limit: int = Query(default=20, ge=1, le=100)):
        try:
            df = store.load_recommendations()
        except FileNotFoundError as e:
            raise HTTPException(status_code=503, detail=str(e))

        users = df["user_idx"].drop_duplicates().sort_values().head(limit).tolist()
        return {"users": users, "total": len(users)}

    return router

