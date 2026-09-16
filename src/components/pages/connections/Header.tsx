import type { CSSProperties } from 'react';

import { palette } from './palette.ts';

interface HeaderProps {
	running: boolean;
	speed: number;
	speeds: number[];
	onToggleRunning: () => void;
	onReset: () => void;
	onSpeedChange: (speed: number) => void;
}

const mono = "var(--font-mono)";
const serif = "var(--font-serif)";

const sx: Record<string, CSSProperties> = {
	header: {
		display: "flex",
		flexWrap: "wrap",
		gap: 10,
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	title: {
		fontFamily: serif,
		color: palette.heading,
		fontWeight: "var(--font-bold)",
		fontSize: "var(--text-lg)",
	},
	controls: {
		display: "flex",
		gap: 6,
		alignItems: "center",
		flexWrap: "wrap",
	},
	btn: {
		background: palette.card,
		color: palette.text,
		border: `1px solid ${palette.cardEdge}`,
		borderRadius: "var(--radius-md)",
		padding: "4px 12px",
		fontSize: "var(--text-xs)",
		fontFamily: mono,
		cursor: "pointer",
	},
	btnAccent: { borderColor: palette.green, color: palette.green },
	speedGroup: { display: "inline-flex", gap: 2, marginLeft: 4 },
	speedBtn: {
		background: "transparent",
		color: palette.faint,
		border: `1px solid ${palette.cardEdge}`,
		borderRadius: "var(--radius-md)",
		padding: "4px 7px",
		fontSize: 11,
		fontFamily: mono,
		cursor: "pointer",
	},
	speedOn: { color: palette.text, background: palette.card },
};

export function Header(props: HeaderProps) {
	return (
		<div style={sx.header}>
			<div>
				<div style={sx.title}>Random connection selection</div>
			</div>
			<div style={sx.controls}>
				<button
					style={{
						...sx.btn,
						...(props.running ? {} : sx.btnAccent),
					}}
					onClick={props.onToggleRunning}
				>
					{props.running ? "Pause" : "Play"}
				</button>
				<button style={sx.btn} onClick={props.onReset}>
					Reset
				</button>
				<span style={sx.speedGroup}>
					{props.speeds.map((x) => (
						<button
							key={x}
							style={{
								...sx.speedBtn,
								...(props.speed === x ? sx.speedOn : {}),
							}}
							onClick={() => props.onSpeedChange(x)}
						>
							{x}×
						</button>
					))}
				</span>
			</div>
		</div>
	);
}
