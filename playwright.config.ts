import { defineConfig, devices } from "@playwright/test";
import { execSync } from "child_process";

// Check if WebKit dependencies are available (requires libavif16 on Linux)
function isWebKitAvailable(): boolean {
	if (process.env.CI) return true; // CI environments have all deps
	try {
		execSync("npx playwright install --dry-run webkit 2>&1", { stdio: "pipe" });
		// Try to detect if libavif is available on Linux
		if (process.platform === "linux") {
			try {
				execSync("ldconfig -p | grep -q libavif", { stdio: "pipe" });
				return true;
			} catch {
				return false;
			}
		}
		return true;
	} catch {
		return false;
	}
}

const webkitAvailable = isWebKitAvailable();
const isCI = !!process.env.CI;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : undefined,
	reporter: [["html", { open: "never" }], ["list"]],
	use: {
		baseURL: "http://localhost:4321",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		// WebKit requires system dependencies (libavif16) - skip if not available
		...(webkitAvailable
			? [
					{
						name: "webkit",
						use: { ...devices["Desktop Safari"] },
					},
				]
			: []),
		{
			name: "mobile-chrome",
			use: { ...devices["Pixel 5"] },
		},
		// Mobile Safari uses WebKit
		...(webkitAvailable
			? [
					{
						name: "mobile-safari",
						use: { ...devices["iPhone 12"] },
					},
				]
			: []),
	],
	webServer: {
		command: "npm run preview",
		url: "http://localhost:4321",
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
