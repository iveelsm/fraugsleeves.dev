export function barToneClass(dead: boolean, freshness: number) {
	if (dead) {
		return "csim-bg-faint";
	}

	if (freshness > 0.5) {
		return "csim-bg-green";
	} else if (freshness > 0.2) {
		return "csim-bg-amber";
	} else {
		return "csim-bg-red";
	}
}

export function nodeModifierClass(flash: string | null) {
	if (flash === "fail") {
		return "csim-node--fail";
	} else if (flash === "hit") {
		return "csim-node--hit";
	} else if (flash === "bypass") {
		return "csim-node--bypass";
	} else {
		return "";
	}
}

export function connModifierClass(flash: string | null) {
	if (flash === "fail") {
		return "csim-conn--fail";
	} else if (flash === "hit") {
		return "csim-conn--hit";
	} else {
		return "";
	}
}
