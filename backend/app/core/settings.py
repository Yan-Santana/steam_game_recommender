from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    backend_dir: str
    local_recs_csv: str
    local_games_csv: str


def get_settings() -> Settings:
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    return Settings(
        backend_dir=backend_dir,
        local_recs_csv=os.getenv(
            "LOCAL_RECS_CSV",
            os.path.join(backend_dir, "data", "recommendations_output.csv"),
        ),
        local_games_csv=os.getenv(
            "LOCAL_GAMES_CSV",
            os.path.join(backend_dir, "data", "games.csv"),
        ),
    )

