import { useEffect, useRef, useState } from "react";

const DEFAULTS = {
	nodes: 4,
	connectionsPerNode: 5,
	requestsPerSecond: 20,
	poolUseProbability: 0.5, // 50% of requests use (and renew) a connection
	idleTimeoutMs: 10000, // server closes connections idle longer than this
	initialSpeed: 1,
};

function makeState(cfg) {
	return {
		simTime: 0,
		reqAccumulator: 0,
		rr: 0,
		lastDispatch: null, // { node, at }
		stats: { total: 0, poolUses: 0, bypassed: 0, failures: 0 },
		nodes: Array.from({ length: cfg.nodes }, (_, i) => ({
			id: i,
			requests: 0,
			failures: 0,
			lastEvent: null, // { type: "bypass" | "hit" | "fail", at }
			conns: Array.from({ length: cfg.connectionsPerNode }, (_, j) => ({
				id: j,
				// Stagger initial freshness so the pools don't all expire in unison.
				lastUsed: -Math.random() * cfg.idleTimeoutMs * 0.5,
				uses: 0,
				deaths: 0,
				lastEvent: null, // { type: "hit" | "fail", at }
			})),
		})),
	};
}

function fireRequest(state, cfg) {
	const node = state.nodes[state.rr];
	state.rr = (state.rr + 1) % state.nodes.length;
	state.stats.total += 1;
	node.requests += 1;
	state.lastDispatch = { node: node.id, at: state.simTime };

	// Half the requests never touch the connection pool (cache hit, no-op, etc.)
	if (Math.random() >= cfg.poolUseProbability) {
		state.stats.bypassed += 1;
		node.lastEvent = { type: "bypass", at: state.simTime };
		return;
	}

	state.stats.poolUses += 1;
	const conn = node.conns[Math.floor(Math.random() * node.conns.length)];
	const dead = state.simTime - conn.lastUsed > cfg.idleTimeoutMs;

	if (dead) {
		// The server closed this connection long ago; the client just found out.
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
	conn.lastUsed = state.simTime; // renewed — or re-established after failing
}

export function useConnectionSimulator(props) {
	const cfg = { ...DEFAULTS, ...props };
	const stateRef = useRef(null);
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

	useEffect(() => {
		let raf;
		let last = performance.now();
		const interval = 1000 / cfg.requestsPerSecond;

		const loop = (t) => {
			const dt = Math.min(t - last, 100); // clamp away background-tab jumps
			last = t;
			if (runningRef.current) {
				const s = stateRef.current;
				const simDt = dt * speedRef.current;
				s.simTime += simDt;
				s.reqAccumulator += simDt;
				while (s.reqAccumulator >= interval) {
					s.reqAccumulator -= interval;
					fireRequest(s, cfg);
				}
				setTick((x) => x + 1);
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const toggleRunning = () => setRunning((r) => !r);
	const reset = () => {
		stateRef.current = makeState(cfg);
		setTick((x) => x + 1);
	};

	const state = stateRef.current;
	const now = state.simTime;
	const deadNow = state.nodes.reduce(
		(acc, n) =>
			acc +
			n.conns.filter((c) => now - c.lastUsed > cfg.idleTimeoutMs).length,
		0,
	);
	const totalConns = cfg.nodes * cfg.connectionsPerNode;
	const poolFailPct =
		state.stats.poolUses > 0
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
	};
}
