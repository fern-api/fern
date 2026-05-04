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

/**
 * Detect whether an image src looks like a leaked filesystem path rather than
 * a proper server URL. Filesystem paths contain OS-specific patterns that
 * should never appear in a rendered <img> src attribute.
 */
function looksLikeFilesystemPath(src: string): string | undefined {
    // file:/// protocol
    if (/^file:\/\/\//i.test(src)) {
        return "uses file:/// protocol";
    }

    // Windows drive letter (e.g., C:/ or C:\)
    if (/^[a-zA-Z]:[/\\]/.test(src)) {
        return "contains Windows drive letter";
    }

    // URL-encoded backslashes (%5C)
    if (src.includes("%5C")) {
        return "contains URL-encoded backslashes (%5C)";
    }

    // Raw backslashes (Windows path separators)
    if (src.includes("\\")) {
        return "contains backslashes";
    }

    // Unresolved file:<uuid> reference (frontend failed to map to a URL)
    if (/^file:[0-9a-f-]+$/i.test(src)) {
        return "contains unresolved file:<uuid> reference";
    }

    return undefined;
}

test.describe("Image rendering validation", () => {
    test("GET /welcome should render images without 404s or filepath leaks", async ({ page }) => {
        // Track all failed image network requests (4xx/5xx or network errors)
        const failedImageRequests: { url: string; status: number }[] = [];
        page.on("response", (response) => {
            const url = response.url();
            const contentType = response.headers()["content-type"] ?? "";
            const isImageRequest =
                contentType.includes("image") || /\.(png|jpe?g|gif|svg|webp|ico|bmp|avif)(\?|$)/i.test(url);
            if (isImageRequest && response.status() >= 400) {
                failedImageRequests.push({ url, status: response.status() });
            }
        });

        // Also track requests that fail at the network level (no response at all)
        const networkFailedImages: string[] = [];
        page.on("requestfailed", (request) => {
            const url = request.url();
            if (/\.(png|jpe?g|gif|svg|webp|ico|bmp|avif)(\?|$)/i.test(url)) {
                networkFailedImages.push(`${url} (${request.failure()?.errorText ?? "unknown error"})`);
            }
        });

        const response = await page.goto("/welcome", {
            waitUntil: "load",
            timeout: 30_000
        });

        expect(response?.status()).toBe(200);

        // Wait for any lazy-loaded images to finish
        await page.waitForTimeout(3000);

        // --- Network-level check: no image requests should have failed ---
        expect(
            failedImageRequests,
            `Image requests returned errors:\n${failedImageRequests.map((r) => `  ${r.status} ${r.url}`).join("\n")}`
        ).toHaveLength(0);

        expect(
            networkFailedImages,
            `Image requests failed at network level:\n${networkFailedImages.join("\n")}`
        ).toHaveLength(0);

        // --- DOM-level check: image src attributes should not contain filesystem paths ---
        const imageSrcs = await page.evaluate(() => {
            const images = document.querySelectorAll("img");
            return Array.from(images).map((img) => img.getAttribute("src") ?? img.src);
        });

        expect(imageSrcs.length, "Expected at least one image on /welcome").toBeGreaterThan(0);

        for (const src of imageSrcs) {
            const pathIssue = looksLikeFilesystemPath(src);
            expect(pathIssue, `Image src "${src}" ${pathIssue}`).toBeUndefined();
        }
    });
});
