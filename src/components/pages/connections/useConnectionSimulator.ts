import { useRef, useState } from "react";

export interface SimulatorConfig {
	nodes: number;
	connectionsPerNode: number;
	requestsPerSecond: number;
	poolUseProbability: number;
	idleTimeoutMs: number;
	initialSpeed: number;
}

const DEFAULTS: SimulatorConfig = {
	nodes: 4,
	connectionsPerNode: 5,
	requestsPerSecond: 20,
	poolUseProbability: 0.5,
	idleTimeoutMs: 10000,
	initialSpeed: 1,
};

interface SimEvent {
	type: "bypass" | "hit" | "fail";
	at: number;
}

interface ConnState {
	id: number;
	lastUsed: number;
	uses: number;
	deaths: number;
	lastEvent: SimEvent | null;
}

interface NodeState {
	id: number;
	requests: number;
	failures: number;
	lastEvent: SimEvent | null;
	conns: ConnState[];
}

interface Dispatch {
	node: number;
	at: number;
}

interface SimState {
	simTime: number;
	reqAccumulator: number;
	rr: number;
	lastDispatch: Dispatch | null;
	stats: { total: number; poolUses: number; bypassed: number; failures: number };
	nodes: NodeState[];
}

function makeState(cfg: SimulatorConfig): SimState {
	return {
		simTime: 0,
		reqAccumulator: 0,
		rr: 0,
		lastDispatch: null,
		stats: { total: 0, poolUses: 0, bypassed: 0, failures: 0 },
		nodes: Array.from({ length: cfg.nodes }, (_, i) => ({
			id: i,
			requests: 0,
			failures: 0,
			lastEvent: null,
			conns: Array.from({ length: cfg.connectionsPerNode }, (_, j) => ({
				id: j,
				// Stagger initial freshness so the pools don't all expire in unison.
				lastUsed: -Math.random() * cfg.idleTimeoutMs * 0.5,
				uses: 0,
				deaths: 0,
				lastEvent: null,
			})),
		})),
	};
}

function fireRequest(state: SimState, cfg: SimulatorConfig): void {
	const node = state.nodes[state.rr];
	state.rr = (state.rr + 1) % state.nodes.length;
	state.stats.total += 1;
	node.requests += 1;
	state.lastDispatch = { node: node.id, at: state.simTime };

	if (Math.random() >= cfg.poolUseProbability) {
		state.stats.bypassed += 1;
		node.lastEvent = { type: "bypass", at: state.simTime };
		return;
	}

	state.stats.poolUses += 1;
	const conn = node.conns[Math.floor(Math.random() * node.conns.length)];
	const dead = state.simTime - conn.lastUsed > cfg.idleTimeoutMs;

	if (dead) {
		state.stats.failures += 1;
		node.failures += 1;
		conn.deaths += 1;
		conn.lastEvent = { type: "fail", at: state.simTime };
		node.lastEvent = { type: "fail", at: state.simTime };
	} else {
		conn.lastEvent = { type: "hit", at: state.simTime };
		node.lastEvent = { type: "hit", at: state.simTime };
	}
	conn.uses += 1;
	conn.lastUsed = state.simTime;
}

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

	// Callback refs can return a cleanup function (React 19), giving us the
	// same mount/unmount lifecycle as an effect without using useEffect.
	// A useState initializer (not useCallback) gives it a stable identity,
	// since the initializer only ever runs once.
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
	const poolFailPct = state.stats.poolUses > 0
			? ((state.stats.failures / state.stats.poolUses) * 100).toFixed(1)
			: "0.0";

	return {
		cfg,
		state,
		now,
		deadNow,
		totalConns,
		poolFailPct,
		running,
		speed,
		toggleRunning,
		setSpeed,
		reset,
		rootRef,
	};
}
