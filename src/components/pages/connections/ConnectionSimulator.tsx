import { formatClock } from './formatClock.ts';
import { Header } from './Header.tsx';
import { LegendItem } from './LegendItem.tsx';
import { LoadBalancer } from './LoadBalancer.tsx';
import { Node } from './Node.tsx';
import { Stat } from './Stat.tsx';
import type { SimulatorConfig } from './state.ts';
import { useConnectionSimulator } from './useConnectionSimulator.ts';

export default function ConnectionSimulator(props: Partial<SimulatorConfig>) {
	const hook = useConnectionSimulator(props);
	const config = hook.cfg;
	const state = hook.state;
	const metadata = hook.metadata;

	return (
		<div ref={hook.rootRef} className="csim-root">
			<Header />

			<div className="csim-stats">
				<Stat label="sim time" value={formatClock(metadata.now)} />
				<Stat label="requests" value={state.stats.total} />
				<Stat label="used pool" value={state.stats.poolUses} />
				<Stat label="failed" value={state.stats.failures} tone="red" />
				<Stat label="fail rate (pool)" value={`${metadata.poolFailPct}%`} tone={state.stats.failures > 0 ? "red" : "muted"} />
				<Stat label="dead now" value={`${metadata.deadNow}/${metadata.totalConns}`} tone={metadata.deadNow > 0 ? "amber" : "green"} />
			</div>

			<LoadBalancer requestsPerSecond={config.requestsPerSecond} lastDispatch={state.lastDispatch} now={metadata.now} />

			<div className="csim-node-row">
				{state.nodes.map((node) => (
					<Node key={node.id} node={node} now={metadata.now} idleTimeoutMs={config.idleTimeoutMs} />
				))}
			</div>

			<div className="csim-legend">
				<LegendItem tone="green" label="fresh" />
				<LegendItem tone="amber" label="aging" />
				<LegendItem tone="red" label="near timeout / failed" />
				<LegendItem tone="faint" label="dead" />
				<LegendItem tone="blue" label="request bypassed pool" />
			</div>
		</div>
	);
}
