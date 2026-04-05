export interface IconProps {
	width?: number;
	height?: number;
	className?: string;
}

export function svgWithAttrs(
	raw: string,
	{ width, height, className }: IconProps,
) {
	let svg = raw.trim();
	if (width !== undefined) {
		svg = svg.replace(/width="[^"]*"/, `width="${width}"`);
	}

	if (height !== undefined) {
		svg = svg.replace(/height="[^"]*"/, `height="${height}"`);
	}

	if (className) {
		svg = svg.replace("<svg", `<svg class="${className}"`);
	}

	return svg;
}
