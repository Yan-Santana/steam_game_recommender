from pydantic import BaseModel


class GameSearchResult(BaseModel):
    app_id: str
    title: str

