import { useState } from "react";
import { BG_CARD2, STEAM_BLUE, TEXT_MUTED } from "../config/theme";
import { ScoreBadge } from "./ScoreBadge";

export function GameCard({ rec, index }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        background: hover ? BG_CARD2 : "transparent",
        borderRadius: 10,
        transition: "background 0.15s",
        cursor: "default"
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: `${STEAM_BLUE}20`,
          border: `1px solid ${STEAM_BLUE}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: STEAM_BLUE,
          flexShrink: 0
        }}
      >
        {index + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#e2e8f0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {rec.title}
        </div>
        <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>App ID: {rec.app_id}</div>
      </div>

      <ScoreBadge score={rec.score} />
    </div>
  );
}

