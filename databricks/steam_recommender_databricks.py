# Databricks notebook source
# MAGIC %md
# MAGIC # Steam Game Recommender — Filtro Colaborativo com Spark MLlib + MLflow
# MAGIC Dataset: https://www.kaggle.com/datasets/antonkozyriev/game-recommendations-on-steam

# COMMAND ----------

# MAGIC %md ## 1. Setup e Imports

# COMMAND ----------

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, avg, dense_rank
from pyspark.sql.window import Window
from pyspark.ml.recommendation import ALS
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml.tuning import ParamGridBuilder, CrossValidator
import mlflow
import mlflow.spark
from mlflow.models.signature import infer_signature
import pandas as pd

spark = SparkSession.builder.appName("SteamRecommender").getOrCreate()

# COMMAND ----------

# MAGIC %md ## 2. Carregamento dos Dados
# MAGIC
# MAGIC Faça upload do arquivo `recommendations.csv` do Kaggle no DBFS:
# MAGIC `dbfs:/FileStore/steam/recommendations.csv`

# COMMAND ----------

df_raw = spark.read.csv(
    "dbfs:/FileStore/steam/recommendations.csv",
    header=True,
    inferSchema=True
)

df_raw.printSchema()
df_raw.show(5)

# COMMAND ----------

# MAGIC %md ## 3. Pré-processamento e EDA

# COMMAND ----------

# Seleciona colunas relevantes e remove nulos
df = df_raw.select(
    col("user_id"),
    col("app_id"),
    col("is_recommended").cast("integer").alias("rating")  # 1 = recomendado, 0 = não
).dropna()

print(f"Total de interações: {df.count():,}")
print(f"Usuários únicos: {df.select('user_id').distinct().count():,}")
print(f"Jogos únicos: {df.select('app_id').distinct().count():,}")

# COMMAND ----------

# Filtra usuários com pelo menos 5 avaliações e jogos com pelo menos 10 avaliações
# (reduz sparsidade e melhora a qualidade do modelo)
user_counts = df.groupBy("user_id").agg(count("*").alias("n_ratings"))
game_counts = df.groupBy("app_id").agg(count("*").alias("n_ratings"))

active_users = user_counts.filter(col("n_ratings") >= 5).select("user_id")
popular_games = game_counts.filter(col("n_ratings") >= 10).select("app_id")

df_filtered = df.join(active_users, on="user_id").join(popular_games, on="app_id")

print(f"Interações após filtragem: {df_filtered.count():,}")

# COMMAND ----------

# Codifica user_id e app_id como inteiros para o ALS
from pyspark.ml.feature import StringIndexer
from pyspark.ml import Pipeline

user_indexer = StringIndexer(inputCol="user_id", outputCol="user_idx")
game_indexer = StringIndexer(inputCol="app_id",  outputCol="game_idx")

pipeline = Pipeline(stages=[user_indexer, game_indexer])
pipeline_model = pipeline.fit(df_filtered)
df_indexed = pipeline_model.transform(df_filtered)

df_indexed.select("user_id", "user_idx", "app_id", "game_idx", "rating").show(5)

# COMMAND ----------

# Salva o pipeline de indexação para uso na API
pipeline_model.write().overwrite().save("dbfs:/FileStore/steam/indexer_pipeline")

# COMMAND ----------

# MAGIC %md ## 4. Treinamento do Modelo ALS com MLflow

# COMMAND ----------

train, test = df_indexed.randomSplit([0.8, 0.2], seed=42)

print(f"Treino: {train.count():,} | Teste: {test.count():,}")

# COMMAND ----------

mlflow.set_experiment("/steam-game-recommender")

with mlflow.start_run(run_name="ALS_collaborative_filter") as run:

    # Hiperparâmetros
    RANK       = 50
    MAX_ITER   = 15
    REG_PARAM  = 0.1
    ALPHA      = 1.0

    mlflow.log_params({
        "rank": RANK,
        "maxIter": MAX_ITER,
        "regParam": REG_PARAM,
        "alpha": ALPHA,
        "train_size": train.count(),
        "test_size": test.count()
    })

    # Treina ALS (Alternating Least Squares — Filtro Colaborativo Implícito)
    als = ALS(
        rank=RANK,
        maxIter=MAX_ITER,
        regParam=REG_PARAM,
        alpha=ALPHA,
        userCol="user_idx",
        itemCol="game_idx",
        ratingCol="rating",
        implicitPrefs=True,       # rating binário (recomendou ou não)
        coldStartStrategy="drop", # evita NaN para usuários/jogos novos
        seed=42
    )

    model = als.fit(train)

    # Avaliação
    predictions = model.transform(test)
    evaluator = RegressionEvaluator(
        metricName="rmse",
        labelCol="rating",
        predictionCol="prediction"
    )
    rmse = evaluator.evaluate(predictions)
    mlflow.log_metric("rmse", rmse)
    print(f"RMSE no conjunto de teste: {rmse:.4f}")

    # Loga o modelo no MLflow Model Registry
    mlflow.spark.log_model(
        model,
        artifact_path="als_model",
        registered_model_name="steam_als_recommender"
    )

    run_id = run.info.run_id
    print(f"Run ID: {run_id}")

# COMMAND ----------

# MAGIC %md ## 5. Promover Modelo para Production no Registry

# COMMAND ----------

from mlflow.tracking import MlflowClient

client = MlflowClient()

# Pega a última versão registrada
latest = client.get_latest_versions("steam_als_recommender", stages=["None"])
version = latest[0].version

client.transition_model_version_stage(
    name="steam_als_recommender",
    version=version,
    stage="Production"
)

print(f"Modelo v{version} promovido para Production.")

# COMMAND ----------

# MAGIC %md ## 6. Teste de Inferência Local

# COMMAND ----------

# Carrega metadados dos jogos (faça upload de games.csv no DBFS também)
games_df = spark.read.csv(
    "dbfs:/FileStore/steam/games.csv",
    header=True,
    inferSchema=True
).select("app_id", "title").dropna()

# Recomendações para todos os usuários (top 10 por usuário)
user_recs = model.recommendForAllUsers(10)

# Explode e join com nomes dos jogos
from pyspark.sql.functions import explode

user_recs_exploded = user_recs.select(
    col("user_idx"),
    explode(col("recommendations")).alias("rec")
).select(
    col("user_idx"),
    col("rec.game_idx").alias("game_idx"),
    col("rec.rating").alias("score")
)

# Join para recuperar app_id original
game_idx_map = df_indexed.select("app_id", "game_idx").distinct()
user_recs_final = user_recs_exploded \
    .join(game_idx_map, on="game_idx") \
    .join(games_df, on="app_id") \
    .select("user_idx", "app_id", "title", "score") \
    .orderBy("user_idx", col("score").desc())

user_recs_final.show(20)

# COMMAND ----------

# Salva recomendações pré-computadas no Delta Lake para a API consumir
user_recs_final.write \
    .format("delta") \
    .mode("overwrite") \
    .save("dbfs:/FileStore/steam/recommendations_output")

print("Recomendações salvas em Delta Lake.")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 7. Expor como API REST via Databricks Model Serving
# MAGIC
# MAGIC Após esse notebook, vá em:
# MAGIC **Machine Learning > Models > steam_als_recommender > Serving**
# MAGIC e habilite o endpoint. O endpoint gerado será usado pelo backend FastAPI.
# MAGIC
# MAGIC Formato de entrada esperado pelo endpoint MLflow:
# MAGIC ```json
# MAGIC { "dataframe_records": [{"user_idx": 42}] }
# MAGIC ```

