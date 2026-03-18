import { BG_CARD2, BORDER, TEXT_MUTED } from "../config/theme";

export function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: BG_CARD2,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "16px 20px",
        flex: 1,
        minWidth: 130
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 6
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || "#e2e8f0" }}>{value}</div>
    </div>
  );
}

