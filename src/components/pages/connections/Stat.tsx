type StatTone = "red" | "amber" | "green" | "muted";

interface StatProps {
	label: string;
	value: string | number;
	tone?: StatTone;
}

const TONE_CLASS: Record<StatTone, string> = {
	red: "csim-text-red",
	amber: "csim-text-amber",
	green: "csim-text-green",
	muted: "csim-text-muted",
};

export function Stat(props: StatProps) {
	const toneClass = props.tone ? TONE_CLASS[props.tone] : "";
	return (
		<div className="csim-stat">
			<div className={`csim-stat-value ${toneClass}`}>{props.value}</div>
			<div className="csim-stat-label">{props.label}</div>
		</div>
	);
}
