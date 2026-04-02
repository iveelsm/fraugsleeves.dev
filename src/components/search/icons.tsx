interface IconProps {
	width?: number;
	height?: number;
	className?: string;
}

export function SearchIcon({ width = 20, height = 20, className }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx={11} cy={11} r={8} />
			<line x1={21} y1={21} x2={16.65} y2={16.65} />
		</svg>
	);
}

export function CloseIcon({ width = 14, height = 14, className }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<line x1={18} y1={6} x2={6} y2={18} />
			<line x1={6} y1={6} x2={18} y2={18} />
		</svg>
	);
}
