import type { CSSProperties } from "react";

import { isRecent } from "./flash";
import { palette } from "./palette";

interface LoadBalancerProps {
	requestsPerSecond: number;
	lastDispatch: { node: number; at: number } | null;
	now: number;
}

const sx: Record<string, CSSProperties> = {
	lbRow: { display: "flex", justifyContent: "center", marginBottom: 10 },
	lb: {
		background: palette.card,
		border: `1px solid ${palette.cardEdge}`,
		borderRadius: "var(--radius-lg)",
		padding: "7px 16px",
		fontFamily: "var(--font-mono)",
		fontSize: "var(--text-xs)",
		display: "flex",
		alignItems: "center",
		gap: 8,
	},
	lbDot: {
		width: 8,
		height: 8,
		borderRadius: "var(--radius-full)",
		background: palette.blue,
		display: "inline-block",
	},
	lbInfo: { color: palette.faint, fontSize: 11 },
	lbDispatch: { color: palette.blue },
};

export function LoadBalancer(props: LoadBalancerProps) {
	const { lastDispatch, now } = props;
	return (
		<div style={sx.lbRow}>
			<div style={sx.lb}>
				<span style={sx.lbDot} />
				load balancer
				<span style={sx.lbInfo}>
					round-robin · {props.requestsPerSecond} req/s
					{lastDispatch && isRecent(lastDispatch.at, now) && <span style={sx.lbDispatch}> → node-{lastDispatch.node}</span>}
				</span>
			</div>
		</div>
	);
}
