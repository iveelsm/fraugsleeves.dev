import type { CSSProperties } from "react";

import { formatClock } from "./formatClock";
import { Header } from "./Header";
import { LegendItem } from "./LegendItem";
import { LoadBalancer } from "./LoadBalancer";
import { Node } from "./Node";
import { palette } from "./palette";
import { Stat } from "./Stat";
import type { SimulatorConfig } from "./useConnectionSimulator";
import { useConnectionSimulator } from "./useConnectionSimulator";

const SPEEDS = [1, 2, 4, 8];

export default function ConnectionSimulator(props: Partial<SimulatorConfig>) {
	const { cfg, state, now, deadNow, totalConns, poolFailPct, running, speed, toggleRunning, setSpeed, reset, rootRef } =
		useConnectionSimulator(props);

	return (
		<div ref={rootRef} style={sx.root}>
			<style>{keyframes}</style>

			<Header
				running={running}
				speed={speed}
				speeds={SPEEDS}
				onToggleRunning={toggleRunning}
				onReset={reset}
				onSpeedChange={setSpeed}
			/>

			<div style={sx.stats}>
				<Stat label="sim time" value={formatClock(now)} />
				<Stat label="requests" value={state.stats.total} />
				<Stat label="used pool" value={state.stats.poolUses} />
				<Stat label="failed" value={state.stats.failures} color={palette.red} />
				<Stat label="fail rate (pool)" value={`${poolFailPct}%`} color={state.stats.failures > 0 ? palette.red : palette.muted} />
				<Stat label="dead now" value={`${deadNow}/${totalConns}`} color={deadNow > 0 ? palette.amber : palette.green} />
			</div>

			<LoadBalancer requestsPerSecond={cfg.requestsPerSecond} lastDispatch={state.lastDispatch} now={now} />

			<div style={sx.nodeRow}>
				{state.nodes.map((node) => (
					<Node key={node.id} node={node} now={now} idleTimeoutMs={cfg.idleTimeoutMs} />
				))}
			</div>

			<div style={sx.legend}>
				<LegendItem color={palette.green} label="fresh" />
				<LegendItem color={palette.amber} label="aging" />
				<LegendItem color={palette.red} label="near timeout / failed" />
				<LegendItem color={palette.faint} label="dead (server closed it)" />
				<LegendItem color={palette.blue} label="request bypassed pool" />
			</div>
		</div>
	);
}

const keyframes = `
@keyframes csim-pulse-fail {
  0% { box-shadow: 0 0 0 0 var(--uchu-red-4); }
  100% { box-shadow: 0 0 0 8px transparent; }
}
@keyframes csim-pulse-hit {
  0% { box-shadow: 0 0 0 0 var(--uchu-green-4); }
  100% { box-shadow: 0 0 0 8px transparent; }
}
`;

const sx: Record<string, CSSProperties> = {
	root: {
		background: palette.bg,
		color: palette.text,
		borderRadius: "var(--radius-lg)",
		padding: "16px 16px 14px",
		fontFamily: "var(--font-mono)",
		fontSize: "var(--text-sm)",
		lineHeight: "var(--leading-tight)",
		maxWidth: "100%",
		boxSizing: "border-box",
		border: `1px solid ${palette.cardEdge}`,
	},
	stats: {
		display: "flex",
		flexWrap: "wrap",
		gap: 6,
		marginBottom: 12,
	},
	nodeRow: {
		display: "flex",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 12,
	},
	legend: {
		display: "flex",
		flexWrap: "wrap",
		gap: 12,
		color: palette.muted,
		fontSize: 11,
		marginBottom: 8,
	},
};
