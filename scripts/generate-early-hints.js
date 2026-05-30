import { readdirSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const cssFiles = readdirSync("dist/_astro")
	.filter((f) => f.endsWith(".css"))
	.map((f) => `/_astro/${f}`);

const directives = cssFiles
	.map((href) => `add_header Link "<${href}>; rel=preload; as=style";`)
	.join("\n");

writeFileSync("deployment/includes/early-hints.conf", directives + "\n");

console.log(`Generated early hints for ${cssFiles.length} CSS file(s)`);
