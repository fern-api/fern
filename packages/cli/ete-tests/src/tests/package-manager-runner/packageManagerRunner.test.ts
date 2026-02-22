import { CONSOLE_LOGGER } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { describe, expect, it } from "vitest";

import { detectPackageManagerRunner, getAllRunners } from "../../../../cli/src/utils/packageManagerRunner.js";

/**
 * E2E tests for package manager runner fallback support.
 *
 * These tests invoke real package managers to execute a lightweight npm package
 * (cowsay) and verify they produce output. Each test is skipped if the
 * corresponding package manager is not installed.
 */

const TIMEOUT = 120_000;

const WHICH_COMMAND = process.platform === "win32" ? "where" : "which";

async function isCommandAvailable(command: string): Promise<boolean> {
    try {
        const { failed } = await loggingExeca(CONSOLE_LOGGER, WHICH_COMMAND, [command], {
            doNotPipeOutput: true,
            reject: false
        });
        return !failed;
    } catch {
        return false;
    }
}

describe("package-manager-runner e2e", () => {
    describe("direct invocation", () => {
        it(
            "npx can execute an npm package",
            async () => {
                const available = await isCommandAvailable("npx");
                if (!available) {
                    console.log("Skipping: npx not available");
                    return;
                }

                const result = await loggingExeca(
                    CONSOLE_LOGGER,
                    "npx",
                    ["--quiet", "--yes", "cowsay@latest", "hello"],
                    {
                        doNotPipeOutput: true,
                        reject: false
                    }
                );

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

    describe("detectPackageManagerRunner", () => {
        it(
            "should detect an available runner via real which/where",
            async () => {
                const runner = await detectPackageManagerRunner(CONSOLE_LOGGER);
                // At least one PM should be installed in any reasonable environment
                expect(runner).toBeDefined();
                expect(runner?.type).toBeDefined();
                expect(runner?.command).toBeDefined();
                expect(runner?.label).toBeDefined();
                expect(typeof runner?.buildArgs).toBe("function");
            },
            TIMEOUT
        );

        it(
            "should return a runner whose command actually exists on PATH",
            async () => {
                const runner = await detectPackageManagerRunner(CONSOLE_LOGGER);
                if (runner == null) {
                    console.log("Skipping: no package manager detected");
                    return;
                }

                // Verify the detected command actually exists
                const available = await isCommandAvailable(runner.command);
                expect(available).toBe(true);
            },
            TIMEOUT
        );

        it(
            "should respect priority order (npx first if available)",
            async () => {
                const npxAvailable = await isCommandAvailable("npx");
                if (!npxAvailable) {
                    console.log("Skipping: npx not available to test priority");
                    return;
                }

                const runner = await detectPackageManagerRunner(CONSOLE_LOGGER);
                // If npx is available, it should always be selected first
                expect(runner?.type).toBe("npm");
                expect(runner?.command).toBe("npx");
            },
            TIMEOUT
        );
    });

    describe("buildArgs integration", () => {
        it(
            "detected runner buildArgs produces a working command",
            async () => {
                const runner = await detectPackageManagerRunner(CONSOLE_LOGGER);
                if (runner == null) {
                    console.log("Skipping: no package manager detected");
                    return;
                }

                // Use the runner's own buildArgs to construct the command,
                // then execute it for real
                const args = runner.buildArgs("cowsay@latest", ["hello from buildArgs"]);
                const result = await loggingExeca(CONSOLE_LOGGER, runner.command, args, {
                    doNotPipeOutput: true,
                    reject: false
                });

                expect(result.failed).toBe(false);
                expect(result.stdout).toContain("hello from buildArgs");
            },
            TIMEOUT
        );

        it(
            "each available runner's buildArgs produces a working command",
            async () => {
                const runners = getAllRunners();
                for (const runner of runners) {
                    const available = await isCommandAvailable(runner.command);
                    if (!available) {
                        console.log(`Skipping ${runner.label}: ${runner.command} not available`);
                        continue;
                    }

                    // For yarn, check version since dlx requires >= 2
                    if (runner.type === "yarn") {
                        const { stdout: yarnVersion } = await loggingExeca(CONSOLE_LOGGER, "yarn", ["--version"], {
                            doNotPipeOutput: true,
                            reject: false
                        });
                        const majorVersion = parseInt(yarnVersion.trim().split(".")[0] ?? "0", 10);
                        if (majorVersion < 2) {
                            console.log(`Skipping ${runner.label}: yarn ${yarnVersion.trim()} does not support dlx`);
                            continue;
                        }
                    }

                    const args = runner.buildArgs("cowsay@latest", ["hello"]);
                    const result = await loggingExeca(CONSOLE_LOGGER, runner.command, args, {
                        doNotPipeOutput: true,
                        reject: false
                    });

                    expect(result.failed).toBe(false);
                    expect(result.stdout).toContain("hello");
                }
            },
            TIMEOUT
        );

        it(
            "buildArgs works with a pinned version",
            async () => {
                const runner = await detectPackageManagerRunner(CONSOLE_LOGGER);
                if (runner == null) {
                    console.log("Skipping: no package manager detected");
                    return;
                }

                // Pin to a specific version to verify version specifiers work
                const args = runner.buildArgs("cowsay@1.6.0", ["pinned version"]);
                const result = await loggingExeca(CONSOLE_LOGGER, runner.command, args, {
                    doNotPipeOutput: true,
                    reject: false
                });

                expect(result.failed).toBe(false);
                expect(result.stdout).toContain("pinned version");
            },
            TIMEOUT
        );
    });
});
