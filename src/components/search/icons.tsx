import closeSvg from "../../icons/close.svg?raw";
import searchSvg from "../../icons/search.svg?raw";

interface IconProps {
	width?: number;
	height?: number;
	className?: string;
}

function svgWithAttrs(raw: string, { width, height, className }: IconProps) {
	let svg = raw.trim();
	if (width !== undefined)
		svg = svg.replace(/width="[^"]*"/, `width="${width}"`);
	if (height !== undefined)
		svg = svg.replace(/height="[^"]*"/, `height="${height}"`);
	if (className) svg = svg.replace("<svg", `<svg class="${className}"`);
	return svg;
}

export function SearchIcon(props: IconProps) {
	return (
		<span
			style={{ display: "inline-flex" }}
			dangerouslySetInnerHTML={{ __html: svgWithAttrs(searchSvg, props) }}
		/>
	);
}

export function CloseIcon(props: IconProps) {
	return (
		<span
			style={{ display: "inline-flex" }}
			dangerouslySetInnerHTML={{ __html: svgWithAttrs(closeSvg, props) }}
		/>
	);
}
