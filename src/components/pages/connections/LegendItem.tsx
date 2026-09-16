
export function LegendItem({ color, label }) {
  return (
    <span style={sx.legendItem}>
      <span style={{ ...sx.legendSwatch, background: color }} />
      {label}
    </span>
  );
}
