import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: ".",
    testMatch: "**/*.spec.ts",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    timeout: 60_000,
    reporter: process.env.CI
        ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }], ["list"]]
        : [["html", { open: "never", outputFolder: "playwright-report" }], ["list"]],

    use: {
        baseURL: process.env.BASE_URL ?? "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure"
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] }
        }
    ]
});
