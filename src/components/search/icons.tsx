import { svgWithAttrs, type IconProps } from "../../icons";
import closeSvg from "../../icons/close.svg?raw";
import searchSvg from "../../icons/search.svg?raw";


export function SearchIcon(props: IconProps) {
	return (
		<span
			style={{ display: "inline-flex", pointerEvents: "none" }}
			dangerouslySetInnerHTML={{ __html: svgWithAttrs(searchSvg, props) }}
		/>
	);
}

export function CloseIcon(props: IconProps) {
	return (
		<span
			style={{ display: "inline-flex", pointerEvents: "none" }}
			dangerouslySetInnerHTML={{ __html: svgWithAttrs(closeSvg, props) }}
		/>
	);
}
