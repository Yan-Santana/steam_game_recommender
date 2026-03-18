from __future__ import annotations

from dataclasses import dataclass
from typing import Optional
import os

import pandas as pd

from app.core.settings import Settings


@dataclass
class DataStore:
    settings: Settings
    recs_df: Optional[pd.DataFrame] = None
    games_df: Optional[pd.DataFrame] = None

    def load_recommendations(self) -> pd.DataFrame:
        if self.recs_df is not None:
            return self.recs_df

        if os.path.exists(self.settings.local_recs_csv):
            self.recs_df = pd.read_csv(self.settings.local_recs_csv)
            return self.recs_df

        raise FileNotFoundError(
            "Arquivo de recomendações não encontrado. "
            "Exporte do Databricks para CSV e salve em backend/data/recommendations_output.csv "
            "(ou defina LOCAL_RECS_CSV)."
        )

    def load_games(self) -> pd.DataFrame:
        if self.games_df is not None:
            return self.games_df

        if os.path.exists(self.settings.local_games_csv):
            games_df = pd.read_csv(self.settings.local_games_csv)[["app_id", "title"]].dropna()
            games_df["app_id"] = games_df["app_id"].astype(str)
            self.games_df = games_df
            return self.games_df

        self.games_df = pd.DataFrame(columns=["app_id", "title"])
        return self.games_df

