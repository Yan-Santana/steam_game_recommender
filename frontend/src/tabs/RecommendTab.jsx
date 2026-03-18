import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { BG_CARD, BG_CARD2, BORDER, STEAM_BLUE, STEAM_GREEN, TEXT_MUTED } from "../config/theme";
import { GameCard } from "../components/GameCard";

export function RecommendTab() {
  const [userId, setUserId] = useState("");
  const [topK, setTopK] = useState(10);
  const [recs, setRecs] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/users?limit=20`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => {});
  }, []);

  const fetchRecs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setRecs(null);
    try {
      const res = await fetch(`${API_BASE}/recommendations/${userId}?top_k=${topK}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || `Erro ${res.status}`);
      }
      setRecs(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, topK]);

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#f8fafc" }}>Recomendações personalizadas</h1>
      <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 28 }}>
        Informe o índice do usuário e veja os jogos recomendados pelo modelo.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 11, color: TEXT_MUTED, display: "block", marginBottom: 6 }}>USER_IDX</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchRecs()}
            placeholder="ex: 42"
            style={{
              width: "100%",
              padding: "10px 14px",
              background: BG_CARD2,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              color: "#f1f5f9",
              fontSize: 14,
              transition: "border-color 0.15s"
            }}
            onFocus={(e) => (e.target.style.borderColor = STEAM_BLUE)}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
        </div>

        <div style={{ minWidth: 140 }}>
          <label style={{ fontSize: 11, color: TEXT_MUTED, display: "block", marginBottom: 6 }}>TOP-K</label>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: BG_CARD2,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              color: "#f1f5f9",
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            {[5, 10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n} jogos
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={fetchRecs}
            disabled={!userId || loading}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              background: loading || !userId ? `${STEAM_GREEN}33` : `${STEAM_GREEN}22`,
              border: `1px solid ${STEAM_GREEN}${loading || !userId ? "44" : "88"}`,
              color: loading || !userId ? `${STEAM_GREEN}66` : STEAM_GREEN,
              cursor: loading || !userId ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              letterSpacing: "0.04em"
            }}
          >
            {loading ? "..." : "→ Buscar"}
          </button>
        </div>
      </div>

      {users.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 8 }}>USUÁRIOS DISPONÍVEIS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {users.slice(0, 12).map((u) => (
              <button
                key={u}
                onClick={() => setUserId(String(u))}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  background: String(userId) === String(u) ? `${STEAM_BLUE}22` : BG_CARD2,
                  border: `1px solid ${String(userId) === String(u) ? STEAM_BLUE : BORDER}`,
                  color: String(userId) === String(u) ? STEAM_BLUE : TEXT_MUTED,
                  cursor: "pointer",
                  transition: "all 0.12s"
                }}
              >
                #{u}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            background: "#7f1d1d22",
            border: "1px solid #7f1d1d",
            color: "#fca5a5",
            fontSize: 13
          }}
        >
          ⚠ {error}
        </div>
      )}

      {recs && (
        <div className="fade-in" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Usuário #{recs.user_idx}</div>
            <div style={{ fontSize: 11, color: TEXT_MUTED }}>{recs.total} recomendações</div>
          </div>
          {recs.recommendations.map((rec, i) => (
            <div key={rec.app_id} style={{ borderBottom: i < recs.recommendations.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <GameCard rec={rec} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

