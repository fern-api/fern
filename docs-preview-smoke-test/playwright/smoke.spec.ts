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

test.describe("Image rendering validation", () => {
    test("GET /welcome should render images that actually load", async ({ page }) => {
        const response = await page.goto("/welcome", {
            waitUntil: "domcontentloaded",
            timeout: 30_000
        });

        expect(response?.status()).toBe(200);

        // Wait for page to fully render and images to load
        await page.waitForTimeout(3000);

        // Collect image loading status from the DOM
        const imageResults = await page.evaluate(() => {
            const images = document.querySelectorAll("img");
            return Array.from(images).map((img) => ({
                src: img.getAttribute("src") ?? img.src,
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            }));
        });

        expect(imageResults.length, "Expected at least one image on /welcome").toBeGreaterThan(0);

        for (const img of imageResults) {
            // Image must have finished loading
            expect(img.complete, `Image did not finish loading: ${img.src}`).toBe(true);

            // Image must have rendered with non-zero dimensions (broken/missing images have naturalWidth 0)
            expect(
                img.naturalWidth,
                `Image failed to load (naturalWidth is 0), likely a broken path: ${img.src}`
            ).toBeGreaterThan(0);

            // Must not contain file:/// protocol (broken local path leak)
            expect(img.src, `Image src should not use file:/// protocol: ${img.src}`).not.toMatch(/^file:\/\/\//);

            // Must not contain Windows drive letters (e.g., C:/ or C:\)
            expect(img.src, `Image src should not contain Windows drive letter: ${img.src}`).not.toMatch(
                /^[a-zA-Z]:[/\\]/
            );

            // Must not contain URL-encoded backslashes (%5C)
            expect(img.src, `Image src should not contain encoded backslashes: ${img.src}`).not.toContain("%5C");

            // Must not contain raw backslashes
            expect(img.src, `Image src should not contain backslashes: ${img.src}`).not.toContain("\\");
        }
    });
});
