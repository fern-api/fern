import { expect, test } from "@playwright/test";
import { PAGES } from "./pages";

test.describe("Smoke test: all pages load", () => {
    for (const pagePath of PAGES) {
        test(`GET ${pagePath} returns 200`, async ({ page }) => {
            const pageErrors: string[] = [];
            page.on("pageerror", (error) => {
                pageErrors.push(error.message);
            });

            const errorBoundaryErrors: string[] = [];
            page.on("console", (msg) => {
                if (msg.type() === "error" && msg.text().includes("[error-boundary-fallback]")) {
                    errorBoundaryErrors.push(msg.text());
                }
            });

            const response = await page.goto(pagePath, {
                waitUntil: "domcontentloaded",
                timeout: 30_000
            });

            expect(response, `Expected a response for ${pagePath}`).not.toBeNull();
            expect(response?.status(), `Expected 200 for ${pagePath} but got ${response?.status()}`).toBe(200);

            expect(pageErrors, `Unexpected page errors on ${pagePath}: ${pageErrors.join(", ")}`).toHaveLength(0);

            // For HTML pages (not sitemap.xml), check that no error boundary rendered
            if (!pagePath.endsWith(".xml")) {
                await page.waitForTimeout(2000);

                const errorBoundary = page.getByText("Something went wrong!");
                const errorBoundaryCount = await errorBoundary.count();
                expect(
                    errorBoundaryCount,
                    `Error boundary "Something went wrong!" found on ${pagePath}. ` +
                        `Console errors: ${errorBoundaryErrors.join("; ") || "none"}`
                ).toBe(0);
            }
        });
    }
});
