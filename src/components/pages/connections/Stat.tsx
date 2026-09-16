import type { CSSProperties } from "react";

interface StatProps {
	label: string;
	value: string | number;
	color?: string;
}

const DEFAULT_COLOR = "#e2e8f0";

const sx: { stat: CSSProperties; value: CSSProperties; label: CSSProperties } = {
	stat: {
		background: "#1e293b",
		border: "1px solid #334155",
		borderRadius: 8,
		padding: "6px 12px",
		minWidth: 74,
		flex: "1 1 auto",
		textAlign: "center",
	},
	value: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace", fontSize: 15, fontWeight: 600 },
	label: {
		color: "#64748b",
		fontSize: 10,
		textTransform: "uppercase",
		letterSpacing: "0.06em",
		marginTop: 1,
	},
};

export function Stat(props: StatProps) {
	return (
		<div style={sx.stat}>
			<div style={{ ...sx.value, color: props.color || DEFAULT_COLOR }}>
				{props.value}
			</div>
			<div style={sx.label}>
				{props.label}
			</div>
		</div>
	);
}
