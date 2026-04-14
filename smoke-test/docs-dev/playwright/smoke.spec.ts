import { expect, test } from "@playwright/test";

const SMOKE_PAGES = ["/", "/welcome"];

test.describe("Docs dev smoke test", () => {
    for (const pagePath of SMOKE_PAGES) {
        test(`GET ${pagePath} returns 200`, async ({ page }) => {
            const pageErrors: string[] = [];
            page.on("pageerror", (error) => {
                pageErrors.push(error.message);
            });

            const response = await page.goto(pagePath, {
                waitUntil: "domcontentloaded",
                timeout: 30_000
            });

            expect(response, `Expected a response for ${pagePath}`).not.toBeNull();
            expect(response?.status(), `Expected 200 for ${pagePath} but got ${response?.status()}`).toBe(200);

            // Verify there were no uncaught page errors
            expect(pageErrors, `Unexpected page errors on ${pagePath}: ${pageErrors.join(", ")}`).toHaveLength(0);
        });
    }
});
