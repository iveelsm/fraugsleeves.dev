# E2E Tests with Playwright

This directory contains end-to-end tests using [Playwright](https://playwright.dev/).

## Test Coverage

| File                        | Feature           | Description                                                                               |
| --------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `search.spec.ts`            | Search            | Tests the search functionality including opening, typing, results, and keyboard shortcuts |
| `toc.spec.ts`               | Table of Contents | Tests TOC navigation, scroll spy, and active link highlighting                            |
| `tag-filtering.spec.ts`     | Tag Filtering     | Tests blog post filtering by tags, URL updates, and browser history                       |
| `heading-anchor.spec.ts`    | Heading Anchors   | Tests copying heading URLs to clipboard and visual feedback                               |
| `mobile-navigation.spec.ts` | Mobile Navigation | Tests hamburger menu, overlay, and mobile-specific UI                                     |

## Running Tests

### Prerequisites

First, install Playwright browsers:

```bash
npx playwright install
```

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# View the HTML report
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/search.spec.ts

# Run tests matching a pattern
npx playwright test -g "should copy URL"

# Run on a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests only
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root.

### Browser Projects

- **chromium** - Desktop Chrome
- **firefox** - Desktop Firefox
- **webkit** - Desktop Safari
- **mobile-chrome** - Mobile Chrome (Pixel 5)
- **mobile-safari** - Mobile Safari (iPhone 12)

### Web Server

Tests automatically start the preview server on `http://localhost:4321` before running.

## Writing New Tests

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/path");
  });

  test("should do something", async ({ page }) => {
    // Arrange
    const element = page.locator(".selector");

    // Act
    await element.click();

    // Assert
    await expect(element).toBeVisible();
  });
});
```

## CI Integration

In CI environments:

- Tests run in headless mode
- Failed tests are retried twice
- Traces are captured on first retry for debugging
- Screenshots are taken on failure

## Debugging Failed Tests

1. Check the HTML report: `npm run test:e2e:report`
2. Look at screenshots in `test-results/`
3. Use trace viewer for step-by-step debugging
4. Run in debug mode: `npm run test:e2e:debug`
