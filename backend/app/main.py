"""
Steam Game Recommender — Backend FastAPI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import get_settings
from app.services.data_store import DataStore
from app.routes import health
from app.routes.recommendations import build_router as build_recommendations_router
from app.routes.users import build_router as build_users_router
from app.routes.games import build_router as build_games_router
from app.routes.stats import build_router as build_stats_router


def create_app() -> FastAPI:
    settings = get_settings()
    store = DataStore(settings=settings)

    app = FastAPI(
        title="Steam Game Recommender API",
        description="Sistema de recomendação de jogos via Filtro Colaborativo (ALS/Spark MLlib + MLflow)",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(build_recommendations_router(store))
    app.include_router(build_users_router(store))
    app.include_router(build_games_router(store))
    app.include_router(build_stats_router(store))

    return app


app = create_app()

