import type { CSSProperties } from "react";

import { barToneClass, connModifierClass, nodeModifierClass } from "./cssModifiers.ts";
import { flashType } from "./flash.ts";

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

export function Node(props: NodeProps) {
	const { node, now, idleTimeoutMs } = props;
	const nodeFlash = flashType(node.lastEvent, now);

	return (
		<div className={`csim-node ${nodeModifierClass(nodeFlash)}`}>
			<div className="csim-node-header">
				<span className="csim-node-name">node-{node.id}</span>
				<span className="csim-node-meta">
					{node.failures > 0 && <span className="csim-node-fail-count">{node.failures}✕ </span>}
					{node.requests}
				</span>
			</div>
			<div className="csim-conn-list">
				{node.conns.map((conn) => {
					const idleFor = now - conn.lastUsed;
					const dead = idleFor > idleTimeoutMs;
					const freshness = Math.max(0, Math.min(1, 1 - idleFor / idleTimeoutMs));
					const connFlash = flashType(conn.lastEvent, now);
					return (
						<div
							key={conn.id}
							className={`csim-conn ${connModifierClass(connFlash)}`}
							title={
								dead
									? `closed by server (idle ${(idleFor / 1000).toFixed(1)}s) — client doesn't know yet`
									: `idle ${(idleFor / 1000).toFixed(1)}s / ${idleTimeoutMs / 1000}s`
							}
						>
							<span className={`csim-conn-dot ${dead ? "csim-bg-red csim-conn-dot--dead" : "csim-bg-green"}`} />
							<span className="csim-conn-track">
								<span
									className={`csim-conn-bar ${barToneClass(dead, freshness)}`}
									style={{ "--conn-bar-width": `${freshness * 100}%` } as CSSProperties}
								/>
							</span>
							{conn.deaths > 0 && <span className="csim-conn-deaths">{conn.deaths}✕</span>}
						</div>
					);
				})}
			</div>
		</div>
	);
}
