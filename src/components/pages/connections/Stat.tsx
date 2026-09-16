import type { CSSProperties } from "react";

interface StatProps {
	label: string;
	value: string | number;
	color?: string;
}

const DEFAULT_COLOR = "var(--color-text)";

const sx: { stat: CSSProperties; value: CSSProperties; label: CSSProperties } = {
	stat: {
		background: "var(--color-surface)",
		border: "1px solid var(--color-border)",
		borderRadius: "var(--radius-lg)",
		padding: "6px 12px",
		minWidth: 74,
		flex: "1 1 auto",
		textAlign: "center",
	},
	value: {
		fontFamily: "var(--font-mono)",
		fontSize: 15,
		fontWeight: "var(--font-semibold)",
	},
	label: {
		color: "var(--uchu-gray-7)",
		fontSize: 10,
		textTransform: "uppercase",
		letterSpacing: "0.06em",
		marginTop: 1,
	},
};

export function Stat(props: StatProps) {
	return (
		<div style={sx.stat}>
			<div style={{ ...sx.value, color: props.color || DEFAULT_COLOR }}>{props.value}</div>
			<div style={sx.label}>{props.label}</div>
		</div>
	);
}
