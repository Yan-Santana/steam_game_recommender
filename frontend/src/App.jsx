import { useState } from "react";

import {
  BG_CARD,
  BG_DARK,
  BORDER,
  STEAM_BLUE,
  STEAM_GREEN,
  TEXT_MUTED,
} from "./config/theme";
import { RecommendTab } from "./tabs/RecommendTab";
import { SearchTab } from "./tabs/SearchTab";
import { StatsTab } from "./tabs/StatsTab";

export default function App() {
  const [activeTab, setActiveTab] = useState("recommend");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG_DARK,
        fontFamily: "'IBM Plex Mono', 'Fira Code', 'Consolas', monospace",
        color: "#e2e8f0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, button { font-family: inherit; }
        input:focus, select:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${BG_DARK}; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.3s ease both; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
      `}</style>

      <header
        style={{
          borderBottom: `1px solid ${BORDER}`,
          padding: "20px 0",
          background: `${BG_CARD}cc`,
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${STEAM_GREEN}33, ${STEAM_BLUE}33)`,
              border: `1px solid ${STEAM_GREEN}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🎮
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}
            >
              Steam Recommender
            </div>
            <div style={{ fontSize: 11, color: TEXT_MUTED }}>
              ALS · Spark MLlib · MLflow · Databricks
            </div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {["recommend", "search", "stats"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 500,
                  border: `1px solid ${activeTab === tab ? STEAM_BLUE : "transparent"}`,
                  background:
                    activeTab === tab ? `${STEAM_BLUE}18` : "transparent",
                  color: activeTab === tab ? STEAM_BLUE : TEXT_MUTED,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {activeTab === "recommend" && <RecommendTab />}
        {activeTab === "search" && <SearchTab />}
        {activeTab === "stats" && <StatsTab />}
      </main>
    </div>
  );
}
