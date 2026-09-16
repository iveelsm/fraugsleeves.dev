type LegendTone = "green" | "amber" | "red" | "blue" | "faint";

interface LegendItemProps {
	tone: LegendTone;
	label: string;
}

const TONE_CLASS: Record<LegendTone, string> = {
	green: "csim-bg-green",
	amber: "csim-bg-amber",
	red: "csim-bg-red",
	blue: "csim-bg-blue",
	faint: "csim-bg-faint",
};

export function LegendItem(props: LegendItemProps) {
	return (
		<span className="csim-legend-item">
			<span className={`csim-legend-swatch ${TONE_CLASS[props.tone]}`} />
			{props.label}
		</span>
	);
}
