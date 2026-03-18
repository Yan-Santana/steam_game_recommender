"""
Compat/entrypoint para rodar via:

uvicorn main:app --reload --port 8000
"""

from app.main import app

