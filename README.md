# 🎮 Steam Game Recommender

Sistema de recomendação de jogos com Filtro Colaborativo (ALS) usando **Spark MLlib**, **MLflow** e **Databricks**, exposto via API REST com **FastAPI** e visualizado em **React**.

---

## Arquitetura

```
Kaggle Dataset (Steam)
        │
        ▼
┌──────────────────────────────┐
│  Databricks Notebook         │
│  · Spark MLlib (ALS)         │
│  · MLflow (versioning)       │
│  · Delta Lake (output)       │
└──────────────┬───────────────┘
               │ REST / Delta
               ▼
┌──────────────────────────────┐
│  FastAPI Backend             │
│  · /recommendations/{user}   │
│  · /games/search             │
│  · /stats                    │
└──────────────┬───────────────┘
               │ HTTP
               ▼
┌──────────────────────────────┐
│  React Frontend              │
│  · Recomendações             │
│  · Busca de jogos            │
│  · Estatísticas              │
└──────────────────────────────┘
```

---

## Estrutura do repositório

```
steam_game_recommender/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── settings.py
│   │   ├── routes/
│   │   │   ├── games.py
│   │   │   ├── health.py
│   │   │   ├── recommendations.py
│   │   │   ├── stats.py
│   │   │   └── users.py
│   │   ├── schemas/
│   │   │   ├── games.py
│   │   │   └── recommendations.py
│   │   ├── services/
│   │   │   └── data_store.py
│   │   └── main.py
│   ├── main.py
│   ├── requirements.txt
│   └── data/
│       ├── README.md
│       ├── recommendations_output.csv   ← exportado do Databricks (você adiciona)
│       └── games.csv                    ← do Kaggle (você adiciona)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       └── App.jsx
│       ├── config/
│       │   ├── api.js
│       │   └── theme.js
│       ├── components/
│       │   ├── GameCard.jsx
│       │   ├── ScoreBadge.jsx
│       │   └── StatCard.jsx
│       └── tabs/
│           ├── RecommendTab.jsx
│           ├── SearchTab.jsx
│           └── StatsTab.jsx
└── databricks/
    └── steam_recommender_databricks.py  ← importe como notebook no Databricks
```

---

## Dataset

Baixe do Kaggle: [Game Recommendations on Steam](https://www.kaggle.com/datasets/antonkozyriev/game-recommendations-on-steam)

Arquivos necessários:
- `recommendations.csv` → upload em `dbfs:/FileStore/steam/recommendations.csv`
- `games.csv` → upload em `dbfs:/FileStore/steam/games.csv`

---

## 1. Databricks — Notebook

### Upload do dataset
No Databricks, acesse **Data > DBFS > FileStore** e faça upload dos CSVs.

### Executar o notebook
Abra `databricks/steam_recommender_databricks.py` no Databricks (importe como notebook Python) e execute célula por célula.

O notebook irá:
1. Carregar e filtrar o dataset
2. Treinar o modelo ALS com Spark MLlib
3. Registrar e versionar via MLflow
4. Promover o modelo para **Production** no Model Registry
5. Salvar recomendações pré-computadas em **Delta Lake**

### Exportar para a API
Após rodar o notebook, exporte as recomendações para CSV:

```python
# Rode no Databricks
spark.read.format("delta") \
    .load("dbfs:/FileStore/steam/recommendations_output") \
    .toPandas() \
    .to_csv("/dbfs/FileStore/steam/recs_export.csv", index=False)
```

Depois baixe via DBFS e coloque em `backend/data/recommendations_output.csv`.

---

## 2. Backend — FastAPI

### Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Dados

Coloque os arquivos em `backend/data/`:
- `recommendations_output.csv` (exportado do Databricks)
- `games.csv` (do Kaggle)

### Variáveis de ambiente (opcional)

Se precisar sobrescrever os caminhos padrão dos arquivos, copie `backend/.env.example` para `backend/.env` e ajuste:
- `LOCAL_RECS_CSV`
- `LOCAL_GAMES_CSV`

### Rodar

```bash
uvicorn main:app --reload --port 8000
```

Observação (WSL/Ubuntu): se você receber erro do tipo **externally managed environment** (PEP 668) ao rodar `pip install`, use sempre um `venv` como acima.

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/recommendations/{user_idx}?top_k=10` | Recomendações para um usuário |
| GET | `/users?limit=20` | Lista de user_idx disponíveis |
| GET | `/games/search?q=termo` | Busca jogos por nome |
| GET | `/stats` | Estatísticas do modelo |
| GET | `/docs` | Swagger UI automático |

---

## 3. Frontend — React

### Setup

```bash
cd frontend
npm install
```

### Variável de ambiente

Crie `.env` em `frontend/` (você pode copiar de `.env.example`):

```env
VITE_API_URL=http://localhost:8000
```

### Rodar

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Processamento | Apache Spark (PySpark) |
| Modelo | ALS — Spark MLlib |
| Versionamento | MLflow Model Registry |
| Plataforma | Databricks |
| Armazenamento | Delta Lake |
| API | FastAPI + Uvicorn |
| Frontend | React + Vite |

---

## Autor

**Yan G. Santana**  
[github.com/Yan-Santana](https://github.com/Yan-Santana)
