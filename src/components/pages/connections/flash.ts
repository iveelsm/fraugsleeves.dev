export const FLASH_MS = 450;

export function isRecent(
	at: number | null | undefined,
	now: number,
	ms = FLASH_MS,
) {
	return at != null && now - at < ms;
}

export function flashType(
	evt: { type: string; at: number } | null | undefined,
	now: number,
	ms = FLASH_MS,
) {
	return evt && isRecent(evt.at, now, ms) ? evt.type : null;
}
