import { STEAM_BLUE, STEAM_GREEN } from "../config/theme";

export function ScoreBadge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? STEAM_GREEN : pct >= 40 ? STEAM_BLUE : "#f97316";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "2px 8px",
        borderRadius: 99,
        border: `1px solid ${color}22`,
        background: `${color}15`,
        color
      }}
    >
      {pct}%
    </span>
  );
}

