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

test.describe("Image path validation: no broken file paths", () => {
    test("GET /welcome should render images without broken file:/// paths", async ({ page }) => {
        const response = await page.goto("/welcome", {
            waitUntil: "domcontentloaded",
            timeout: 30_000
        });

        expect(response?.status()).toBe(200);

        // Wait for page to fully render
        await page.waitForTimeout(2000);

        // Collect all image src attributes from the page
        const imgSrcs = await page.evaluate(() => {
            const images = document.querySelectorAll("img");
            return Array.from(images).map((img) => img.getAttribute("src") ?? img.src);
        });

        expect(imgSrcs.length, "Expected at least one image on /welcome").toBeGreaterThan(0);

        for (const src of imgSrcs) {
            // Must not contain file:/// protocol (broken local path leak)
            expect(src, `Image src should not use file:/// protocol: ${src}`).not.toMatch(/^file:\/\/\//);

            // Must not contain Windows drive letters (e.g., C:/ or C:\)
            expect(src, `Image src should not contain Windows drive letter: ${src}`).not.toMatch(/^[a-zA-Z]:[/\\]/);

            // Must not contain URL-encoded backslashes (%5C)
            expect(src, `Image src should not contain encoded backslashes: ${src}`).not.toContain("%5C");

            // Must not contain raw backslashes
            expect(src, `Image src should not contain backslashes: ${src}`).not.toContain("\\");
        }
    });
});
