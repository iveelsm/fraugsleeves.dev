export function Stat({ label, value, color }) {
  return (
    <div style={sx.stat}>
      <div style={{ ...sx.statValue, color: color || palette.text }}>
        {value}
      </div>
      <div style={sx.statLabel}>{label}</div>
    </div>
  );
}
