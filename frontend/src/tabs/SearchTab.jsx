import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { BG_CARD, BG_CARD2, BORDER, STEAM_BLUE, TEXT_MUTED } from "../config/theme";

export function SearchTab() {
  const [search, setSearch] = useState("");
  const [searchRes, setSearchRes] = useState([]);

  const fetchSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setSearchRes([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/games/search?q=${encodeURIComponent(q)}`);
      setSearchRes(await res.json());
    } catch {
      setSearchRes([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchSearch(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchSearch]);

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#f8fafc" }}>Buscar jogos</h1>
      <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 28 }}>Pesquise no catálogo de jogos disponíveis no dataset.</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Digite o nome do jogo..."
        style={{
          width: "100%",
          padding: "12px 16px",
          background: BG_CARD2,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          color: "#f1f5f9",
          fontSize: 14,
          marginBottom: 20
        }}
        onFocus={(e) => (e.target.style.borderColor = STEAM_BLUE)}
        onBlur={(e) => (e.target.style.borderColor = BORDER)}
      />

      {searchRes.length > 0 && (
        <div className="fade-in" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
          {searchRes.map((g, i) => (
            <div
              key={g.app_id}
              style={{
                padding: "12px 18px",
                borderBottom: i < searchRes.length - 1 ? `1px solid ${BORDER}` : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: 14, color: "#e2e8f0" }}>{g.title}</span>
              <span style={{ fontSize: 11, color: TEXT_MUTED }}>#{g.app_id}</span>
            </div>
          ))}
        </div>
      )}

      {search.length >= 2 && searchRes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: TEXT_MUTED, fontSize: 13 }}>
          Nenhum jogo encontrado para "{search}"
        </div>
      )}
    </div>
  );
}

