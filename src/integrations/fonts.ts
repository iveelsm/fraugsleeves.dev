import type { AstroIntegration } from "astro";
import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync } from "fs";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

export interface FontsIntegrationOptions {
	/**
	 * Filter function to select which font files to copy.
	 * Receives the font filename and should return true to include the font.
	 * If not provided, all fonts are copied.
	 */
	filter?: (filename: string) => boolean;
	/**
	 * Output directory name within the build folder.
	 * Defaults to "fonts"
	 */
	outputDir?: string;
}

interface FontInfo {
	filename: string;
	sourcePath: string;
	relativePath: string;
}

const require = createRequire(import.meta.url);

function getFontsPackageInfo(): { fontsDir: string; cssPath: string } | null {
	try {
		const fontsPackagePath = require.resolve("@iveelsm/fonts/package.json");
		const fontsDir = dirname(fontsPackagePath);
		const cssPath = join(fontsDir, "src", "index.css");
		return { fontsDir, cssPath };
	} catch {
		return null;
	}
}

function getAvailableFonts(fontsDir: string): FontInfo[] {
	const srcDir = join(fontsDir, "src");
	if (!existsSync(srcDir)) {
		return [];
	}

	const fonts: FontInfo[] = [];
	const entries = readdirSync(srcDir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			// Scan subdirectories for font files
			const subDirPath = join(srcDir, entry.name);
			const subFiles = readdirSync(subDirPath);
			for (const file of subFiles) {
				if (/\.(woff2?|ttf|otf|eot)$/i.test(file)) {
					fonts.push({
						filename: file,
						sourcePath: join(subDirPath, file),
						relativePath: `${entry.name}/${file}`,
					});
				}
			}
		} else if (/\.(woff2?|ttf|otf|eot)$/i.test(entry.name)) {
			// Font file directly in src
			fonts.push({
				filename: entry.name,
				sourcePath: join(srcDir, entry.name),
				relativePath: entry.name,
			});
		}
	}

	return fonts;
}

function transformCss(
	rawCss: string,
	outputDir: string,
	filter?: (filename: string) => boolean,
): string {
	return rawCss.replace(
		/url\(["']?\.\/([^"')]+)["']?\)/g,
		(match, relativePath) => {
			const filename = basename(relativePath);
			// If filter is provided and returns false, keep original (will be removed later)
			if (filter && !filter(filename)) {
				return match;
			}
			return `url("/${outputDir}/${filename}")`;
		},
	);
}

function filterCssFontFaces(
	css: string,
	filter?: (filename: string) => boolean,
): string {
	if (!filter) {
		return css;
	}

	// Remove @font-face blocks that reference filtered-out fonts
	// Match entire @font-face blocks including multi-line content
	return css.replace(
		/@font-face\s*\{[^}]*\}/gs,
		(match) => {
			// Extract all font filenames from this @font-face block
			const urlMatches = match.matchAll(/url\(["']?\.\/([^"')]+)["']?\)/g);
			for (const urlMatch of urlMatches) {
				const relativePath = urlMatch[1];
				const filename = basename(relativePath);
				if (filter(filename)) {
					return match; // Keep this @font-face block
				}
			}
			return ""; // Remove this @font-face block
		},
	);
}

export function fontsIntegration(
	options: FontsIntegrationOptions = {},
): AstroIntegration {
	const { filter, outputDir = "fonts" } = options;

	let fontsInfo: { fontsDir: string; cssPath: string } | null = null;
	let availableFonts: FontInfo[] = [];
	let transformedCss: string = "";

	return {
		name: "fonts-integration",
		hooks: {
			"astro:config:setup": ({ logger }) => {
				fontsInfo = getFontsPackageInfo();

				if (!fontsInfo) {
					logger.warn(
						"@iveelsm/fonts package not found. Fonts will not be copied.",
					);
					return;
				}

				availableFonts = getAvailableFonts(fontsInfo.fontsDir);

				if (filter) {
					availableFonts = availableFonts.filter((font) =>
						filter(font.filename),
					);
				}

				logger.info(
					`Found ${availableFonts.length} font file(s) to copy`,
				);

				// Read and transform CSS
				if (existsSync(fontsInfo.cssPath)) {
					let rawCss = readFileSync(fontsInfo.cssPath, "utf-8");
					// First filter out unwanted @font-face blocks
					rawCss = filterCssFontFaces(rawCss, filter);
					// Then transform the remaining URLs
					transformedCss = transformCss(rawCss, outputDir, filter);
				}
			},
			"astro:build:done": ({ dir, logger }) => {
				if (!fontsInfo || availableFonts.length === 0) {
					return;
				}

				const outputPath = fileURLToPath(new URL(outputDir, dir));

				// Create the fonts directory
				if (!existsSync(outputPath)) {
					mkdirSync(outputPath, { recursive: true });
				}

				// Copy each font file
				for (const font of availableFonts) {
					const destPath = join(outputPath, font.filename);
					try {
						copyFileSync(font.sourcePath, destPath);
						logger.info(`Copied ${font.filename}`);
					} catch (error) {
						logger.error(
							`Failed to copy ${font.filename}: ${error}`,
						);
					}
				}

				logger.info(
					`Copied ${availableFonts.length} font file(s) to ${outputDir}/`,
				);
			},
		},
	};
}

/**
 * Get the transformed CSS for use in components.
 * This should be called after the integration has been initialized.
 */
export function getFontsCss(
	options: FontsIntegrationOptions = {},
): string {
	const { filter, outputDir = "fonts" } = options;
	const fontsInfo = getFontsPackageInfo();

	if (!fontsInfo || !existsSync(fontsInfo.cssPath)) {
		return "";
	}

	let rawCss = readFileSync(fontsInfo.cssPath, "utf-8");
	rawCss = filterCssFontFaces(rawCss, filter);
	return transformCss(rawCss, outputDir, filter);
}

/**
 * Get a list of available font filenames from the @iveelsm/fonts package.
 */
export function getAvailableFontNames(): string[] {
	const fontsInfo = getFontsPackageInfo();
	if (!fontsInfo) {
		return [];
	}
	return getAvailableFonts(fontsInfo.fontsDir).map((f) => f.filename);
}

export default fontsIntegration;
