import { isRecent } from './flash.ts';

interface LoadBalancerProps {
	requestsPerSecond: number;
	lastDispatch: { node: number; at: number } | null;
	now: number;
}

export function LoadBalancer(props: LoadBalancerProps) {
	const { lastDispatch, now } = props;
	return (
		<div className="csim-lb-row">
			<div className="csim-lb">
				<span className="csim-lb-dot" />
				load balancer
				<span className="csim-lb-info">
					round-robin · {props.requestsPerSecond} req/s
					{lastDispatch && isRecent(lastDispatch.at, now) && <span className="csim-lb-dispatch"> → node-{lastDispatch.node}</span>}
				</span>
			</div>
		</div>
	);
}
