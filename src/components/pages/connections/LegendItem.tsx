import type { CSSProperties } from 'react';

interface LegendItemProps {
	color: string;
	label: string;
}

const sx: { item: CSSProperties; swatch: CSSProperties } = {
	item: {
		display: "inline-flex",
		alignItems: "center",
		gap: 5,
	},
	swatch: {
		width: 8,
		height: 8,
		borderRadius: 2,
		display: "inline-block",
	},
};

export function LegendItem(props: LegendItemProps) {
	return (
		<span style={sx.item}>
			<span style={{ ...sx.swatch, background: props.color }} />
			{props.label}
		</span>
	);
}
