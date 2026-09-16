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

export interface SimulatorConfig {
	nodes: number;
	connectionsPerNode: number;
	requestsPerSecond: number;
	poolUseProbability: number;
	idleTimeoutMs: number;
	initialSpeed: number;
}

export interface SimState {
	simTime: number;
	reqAccumulator: number;
	rr: number;
	lastDispatch: Dispatch | null;
	stats: { total: number; poolUses: number; bypassed: number; failures: number };
	nodes: NodeState[];
}

export function fireRequest(state: SimState, cfg: SimulatorConfig): void {
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

export function makeState(cfg: SimulatorConfig): SimState {
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
				lastUsed: -Math.random() * cfg.idleTimeoutMs * 0.5,
				uses: 0,
				deaths: 0,
				lastEvent: null,
			})),
		})),
	};
}
