import type { CSSProperties } from "react";

import { FLASH_MS, flashType } from "./flash";
import { palette } from "./palette";

interface Conn {
	id: number;
	lastUsed: number;
	uses: number;
	deaths: number;
	lastEvent: { type: string; at: number } | null;
}

interface NodeData {
	id: number;
	requests: number;
	failures: number;
	lastEvent: { type: string; at: number } | null;
	conns: Conn[];
}

interface NodeProps {
	node: NodeData;
	now: number;
	idleTimeoutMs: number;
}

const mono = "var(--font-mono)";

const sx: Record<string, CSSProperties> = {
	node: {
		background: palette.card,
		border: `1px solid ${palette.cardEdge}`,
		borderRadius: "var(--radius-lg)",
		padding: "8px 10px",
		flex: "1 1 150px",
		minWidth: 140,
		boxSizing: "border-box",
		transition: "border-color 120ms",
	},
	nodeHit: {
		borderColor: palette.green,
		animation: `csim-pulse-hit ${FLASH_MS}ms ease-out`,
	},
	nodeFail: {
		borderColor: palette.red,
		animation: `csim-pulse-fail ${FLASH_MS}ms ease-out`,
	},
	nodeBypass: { borderColor: palette.blue },
	nodeHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "baseline",
		marginBottom: 7,
	},
	nodeName: {
		fontFamily: mono,
		fontSize: 12,
		fontWeight: "var(--font-semibold)",
	},
	nodeMeta: { fontFamily: mono, fontSize: 10, color: palette.faint },
	connList: { display: "flex", flexDirection: "column", gap: 5 },
	conn: {
		display: "flex",
		alignItems: "center",
		gap: 6,
		borderRadius: "var(--radius-sm)",
		padding: "2px 3px",
		transition: "background 120ms",
	},
	connHit: {
		background: "color-mix(in srgb, var(--uchu-green-5) 15%, transparent)",
	},
	connFail: {
		background: "color-mix(in srgb, var(--uchu-red-5) 18%, transparent)",
	},
	connDot: {
		width: 7,
		height: 7,
		borderRadius: "var(--radius-full)",
		flex: "0 0 auto",
	},
	connDotDead: { boxShadow: `0 0 5px ${palette.red}` },
	connTrack: {
		flex: "1 1 auto",
		height: 6,
		background: palette.track,
		borderRadius: "var(--radius-sm)",
		overflow: "hidden",
		display: "block",
	},
	connBar: {
		display: "block",
		height: "100%",
		borderRadius: "var(--radius-sm)",
		transition: "width 200ms linear",
	},
	connDeaths: {
		fontFamily: mono,
		fontSize: 9,
		color: palette.red,
		flex: "0 0 auto",
	},
};

export function Node(props: NodeProps) {
	const { node, now, idleTimeoutMs } = props;
	const nodeFlash = flashType(node.lastEvent, now);

	return (
		<div
			style={{
				...sx.node,
				...(nodeFlash === "fail" ? sx.nodeFail : nodeFlash === "hit" ? sx.nodeHit : nodeFlash === "bypass" ? sx.nodeBypass : {}),
			}}
		>
			<div style={sx.nodeHeader}>
				<span style={sx.nodeName}>node-{node.id}</span>
				<span style={sx.nodeMeta}>
					{node.failures > 0 && <span style={{ color: palette.red }}>{node.failures}✕ </span>}
					{node.requests}
				</span>
			</div>
			<div style={sx.connList}>
				{node.conns.map((conn) => {
					const idleFor = now - conn.lastUsed;
					const dead = idleFor > idleTimeoutMs;
					const freshness = Math.max(0, Math.min(1, 1 - idleFor / idleTimeoutMs));
					const connFlash = flashType(conn.lastEvent, now);
					const barColor = dead ? palette.faint : freshness > 0.5 ? palette.green : freshness > 0.2 ? palette.amber : palette.red;
					return (
						<div
							key={conn.id}
							style={{
								...sx.conn,
								...(connFlash === "fail" ? sx.connFail : connFlash === "hit" ? sx.connHit : {}),
							}}
							title={
								dead
									? `closed by server (idle ${(idleFor / 1000).toFixed(1)}s) — client doesn't know yet`
									: `idle ${(idleFor / 1000).toFixed(1)}s / ${idleTimeoutMs / 1000}s`
							}
						>
							<span
								style={{
									...sx.connDot,
									background: dead ? palette.red : palette.green,
									...(dead ? sx.connDotDead : {}),
								}}
							/>
							<span style={sx.connTrack}>
								<span
									style={{
										...sx.connBar,
										width: `${freshness * 100}%`,
										background: barColor,
									}}
								/>
							</span>
							{conn.deaths > 0 && <span style={sx.connDeaths}>{conn.deaths}✕</span>}
						</div>
					);
				})}
			</div>
		</div>
	);
}
