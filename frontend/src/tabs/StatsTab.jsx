import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { BG_CARD, BORDER, STEAM_BLUE, STEAM_GREEN, TEXT_MUTED } from "../config/theme";
import { StatCard } from "../components/StatCard";

export function StatsTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#f8fafc" }}>Estatísticas do modelo</h1>
      <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 28 }}>
        Métricas do dataset e informações sobre o modelo em produção.
      </p>

      {stats ? (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <StatCard label="Interações" value={stats.total_interactions?.toLocaleString("pt-BR")} accent={STEAM_GREEN} />
            <StatCard label="Usuários" value={stats.unique_users?.toLocaleString("pt-BR")} accent={STEAM_BLUE} />
            <StatCard label="Jogos" value={stats.unique_games?.toLocaleString("pt-BR")} accent="#a78bfa" />
            <StatCard label="Score médio" value={(stats.avg_score * 100).toFixed(1) + "%"} accent="#fb923c" />
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
            <div
              style={{
                fontSize: 11,
                color: TEXT_MUTED,
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}
            >
              Detalhes do modelo
            </div>
            {[
              ["Algoritmo", stats.model],
              ["MLflow Registry", stats.mlflow_registry],
              ["Framework", "Apache Spark MLlib"],
              ["Plataforma", "Databricks"],
              ["Deployment", "REST API via FastAPI"]
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: `1px solid ${BORDER}`,
                  fontSize: 13
                }}
              >
                <span style={{ color: TEXT_MUTED }}>{k}</span>
                <span style={{ color: "#e2e8f0", textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0", color: TEXT_MUTED }}>
          <div
            className="spinner"
            style={{
              width: 24,
              height: 24,
              border: `2px solid ${BORDER}`,
              borderTopColor: STEAM_BLUE,
              borderRadius: "50%",
              margin: "0 auto 12px"
            }}
          />
          Carregando...
        </div>
      )}
    </div>
  );
}

