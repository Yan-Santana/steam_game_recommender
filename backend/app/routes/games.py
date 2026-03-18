from fastapi import APIRouter, Query
from typing import List

from app.schemas.games import GameSearchResult
from app.services.data_store import DataStore


def build_router(store: DataStore) -> APIRouter:
    router = APIRouter(tags=["Games"])

    @router.get(
        "/games/search",
        response_model=List[GameSearchResult],
        summary="Busca jogos por nome",
    )
    def search_games(q: str = Query(..., min_length=2, description="Termo de busca")):
        games = store.load_games()
        mask = games["title"].str.contains(q, case=False, na=False)
        results = games[mask].head(20)
        return [GameSearchResult(app_id=row["app_id"], title=row["title"]) for _, row in results.iterrows()]

    return router

