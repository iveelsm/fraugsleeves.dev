import { execSync } from "child_process";

import { defineConfig, devices } from "@playwright/test";

// Check if WebKit dependencies are available
function isWebKitAvailable(): boolean {
	if (process.env.CI) {
		return true;
	}

	try {
		execSync("npx playwright install --dry-run webkit 2>&1", {
			stdio: "pipe",
		});
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
			name: "Desktop Chrome",
			grep: /@desktop/,
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "Desktop Firefox",
			grep: /@desktop/,
			use: { ...devices["Desktop Firefox"] },
		},
		// WebKit requires system dependencies (libavif16) - skip if not available
		...(webkitAvailable
			? [
					{
						name: "Desktop Safari",
						grep: /@desktop/,
						use: { ...devices["Desktop Safari"] },
					},
				]
			: []),
		{
			name: "Mobile Chrome",
			grep: /@mobile/,
			use: { ...devices["Pixel 5"] },
		},
		// Mobile Safari uses WebKit
		...(webkitAvailable
			? [
					{
						name: "Mobile Safari",
						grep: /@mobile/,
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
