export function isActive(
	currentPath: string,
	href: string,
	exact: boolean,
): boolean {
	if (exact) {
		return currentPath === href;
	}

	return currentPath === href || currentPath.startsWith(href + "/");
}
