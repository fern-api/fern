import { CONSOLE_LOGGER } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { describe, expect, it } from "vitest";

/**
 * E2E tests for package manager runner fallback support.
 *
 * These tests invoke real package managers to execute a lightweight npm package
 * (cowsay) and verify they produce output. Each test is skipped if the
 * corresponding package manager is not installed.
 */

const TIMEOUT = 120_000;

async function isCommandAvailable(command: string): Promise<boolean> {
    try {
        const { failed } = await loggingExeca(CONSOLE_LOGGER, "which", [command], {
            doNotPipeOutput: true,
            reject: false
        });
        return !failed;
    } catch {
        return false;
    }
}

describe("package-manager-runner e2e", () => {
    it(
        "npx can execute an npm package",
        async () => {
            const available = await isCommandAvailable("npx");
            if (!available) {
                console.log("Skipping: npx not available");
                return;
            }

            const result = await loggingExeca(CONSOLE_LOGGER, "npx", ["--quiet", "--yes", "cowsay@latest", "hello"], {
                doNotPipeOutput: true,
                reject: false
            });

            expect(result.failed).toBe(false);
            expect(result.stdout).toContain("hello");
        },
        TIMEOUT
    );

    it(
        "pnpm dlx can execute an npm package",
        async () => {
            const available = await isCommandAvailable("pnpm");
            if (!available) {
                console.log("Skipping: pnpm not available");
                return;
            }

            const result = await loggingExeca(CONSOLE_LOGGER, "pnpm", ["dlx", "cowsay@latest", "hello"], {
                doNotPipeOutput: true,
                reject: false
            });

            expect(result.failed).toBe(false);
            expect(result.stdout).toContain("hello");
        },
        TIMEOUT
    );

    it(
        "yarn dlx can execute an npm package",
        async () => {
            const available = await isCommandAvailable("yarn");
            if (!available) {
                console.log("Skipping: yarn not available");
                return;
            }

            // Check yarn version - dlx only works on yarn >= 2
            const { stdout: yarnVersion } = await loggingExeca(CONSOLE_LOGGER, "yarn", ["--version"], {
                doNotPipeOutput: true,
                reject: false
            });
            const majorVersion = parseInt(yarnVersion.trim().split(".")[0] ?? "0", 10);
            if (majorVersion < 2) {
                console.log(`Skipping: yarn ${yarnVersion.trim()} does not support dlx (requires >= 2)`);
                return;
            }

            const result = await loggingExeca(CONSOLE_LOGGER, "yarn", ["dlx", "cowsay@latest", "hello"], {
                doNotPipeOutput: true,
                reject: false
            });

            expect(result.failed).toBe(false);
            expect(result.stdout).toContain("hello");
        },
        TIMEOUT
    );

    it(
        "bunx can execute an npm package",
        async () => {
            const available = await isCommandAvailable("bunx");
            if (!available) {
                console.log("Skipping: bunx not available");
                return;
            }

            const result = await loggingExeca(CONSOLE_LOGGER, "bunx", ["cowsay@latest", "hello"], {
                doNotPipeOutput: true,
                reject: false
            });

            expect(result.failed).toBe(false);
            expect(result.stdout).toContain("hello");
        },
        TIMEOUT
    );

    it(
        "deno run can execute an npm package",
        async () => {
            const available = await isCommandAvailable("deno");
            if (!available) {
                console.log("Skipping: deno not available");
                return;
            }

            const result = await loggingExeca(CONSOLE_LOGGER, "deno", ["run", "-A", "npm:cowsay@latest", "hello"], {
                doNotPipeOutput: true,
                reject: false
            });

            expect(result.failed).toBe(false);
            expect(result.stdout).toContain("hello");
        },
        TIMEOUT
    );
});
