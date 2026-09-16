import { useRef, useState } from 'react';

import type { SimulatorConfig, SimState, } from './state.ts';
import { fireRequest, makeState } from './state.ts';

const DEFAULTS: SimulatorConfig = {
	nodes: 4,
	connectionsPerNode: 5,
	requestsPerSecond: 10,
	poolUseProbability: 0.5,
	idleTimeoutMs: 10000,
	initialSpeed: 1,
};

export function useConnectionSimulator(props?: Partial<SimulatorConfig>) {
	const cfg: SimulatorConfig = { ...DEFAULTS, ...props };
	const stateRef = useRef<SimState | null>(null);
	if (stateRef.current === null) {
		stateRef.current = makeState(cfg);
	}

	const [running, setRunning] = useState(true);
	const [speed, setSpeed] = useState(cfg.initialSpeed);
	const [, setTick] = useState(0);

	const runningRef = useRef(running);
	runningRef.current = running;
	const speedRef = useRef(speed);
	speedRef.current = speed;

	const [rootRef] = useState(() => (node: Element | null) => {
		if (node === null) return;

		let raf: number;
		let last = performance.now();
		const interval = 1000 / cfg.requestsPerSecond;

		const loop = (t: number) => {
			const dt = Math.min(t - last, 100);
			last = t;
			if (runningRef.current) {
				const s = stateRef.current;
				if (s !== null) {
					const simDt = dt * speedRef.current;
					s.simTime += simDt;
					s.reqAccumulator += simDt;
					while (s.reqAccumulator >= interval) {
						s.reqAccumulator -= interval;
						fireRequest(s, cfg);
					}
				}
				setTick((x) => x + 1);
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});

	const toggleRunning = () => setRunning((r) => !r);
	const reset = () => {
		stateRef.current = makeState(cfg);
		setTick((x) => x + 1);
	};

	const state = stateRef.current ?? makeState(cfg);
	const now = state.simTime;
	const deadNow = state.nodes.reduce((acc, n) => acc + n.conns.filter((c) => now - c.lastUsed > cfg.idleTimeoutMs).length, 0);
	const totalConns = cfg.nodes * cfg.connectionsPerNode;
	const poolFailPct = state.stats.poolUses > 0 ? ((state.stats.failures / state.stats.poolUses) * 100).toFixed(1) : "0.0";

	return {
		cfg,
		state,
		metadata: {
			now,
			deadNow,
			totalConns,
			poolFailPct,
			running,
			speed,
		},
		toggleRunning,
		setSpeed,
		reset,
		rootRef,
	};
}
