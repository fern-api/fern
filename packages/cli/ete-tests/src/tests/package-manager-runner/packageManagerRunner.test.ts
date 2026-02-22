import { CONSOLE_LOGGER } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it } from "vitest";

/**
 * E2E tests for package manager runner fallback support.
 *
 * These tests invoke real package managers to execute a lightweight npm package
 * (cowsay) and verify they produce output. Each test is skipped if the
 * corresponding package manager is not installed.
 */

const TIMEOUT = 120_000;
const MODULE_INSTALL_TIMEOUT = 300_000;

const WHICH_COMMAND = process.platform === "win32" ? "where" : "which";

/**
 * Mirror of the PackageManagerRunner interface from the CLI source.
 * Defined here so that E2E tests don't import across package boundaries.
 */
interface PackageManagerRunner {
    type: "npm" | "pnpm" | "yarn" | "bun" | "deno";
    command: string;
    buildArgs(packageAtVersion: string, args: string[]): string[];
    label: string;
}

/**
 * Runner definitions identical to those in packageManagerRunner.ts.
 * Duplicated here intentionally so the E2E tests exercise the same
 * command/arg patterns without a cross-package import.
 */
const ALL_RUNNERS: PackageManagerRunner[] = [
    {
        type: "npm",
        command: "npx",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return ["--quiet", "--yes", packageAtVersion, ...args];
        },
        label: "npx (npm)"
    },
    {
        type: "pnpm",
        command: "pnpm",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return ["dlx", packageAtVersion, ...args];
        },
        label: "pnpm dlx"
    },
    {
        type: "yarn",
        command: "yarn",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return ["dlx", packageAtVersion, ...args];
        },
        label: "yarn dlx"
    },
    {
        type: "bun",
        command: "bunx",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return [packageAtVersion, ...args];
        },
        label: "bunx (bun)"
    },
    {
        type: "deno",
        command: "deno",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return ["run", "-A", `npm:${packageAtVersion}`, ...args];
        },
        label: "deno run"
    }
];

/**
 * Detect the first available package manager runner, mirroring the
 * production detectPackageManagerRunner() logic.
 */
async function detectPackageManagerRunner(): Promise<PackageManagerRunner | undefined> {
    for (const runner of ALL_RUNNERS) {
        const exists = await isCommandAvailable(runner.command);
        if (exists) {
            return runner;
        }
    }
    return undefined;
}

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

async function createTempProjectDir(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), "fern-pm-install-"));
    await writeFile(join(dir, "package.json"), JSON.stringify({ name: "fern-pm-install", private: true }, null, 2));
    return dir;
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
                const runner = await detectPackageManagerRunner();
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
                const runner = await detectPackageManagerRunner();
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

                const runner = await detectPackageManagerRunner();
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
                const runner = await detectPackageManagerRunner();
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
                const runners = ALL_RUNNERS;
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
                const runner = await detectPackageManagerRunner();
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

    describe("module install + import", () => {
        const PACKAGE_AT_VERSION = "is-number@7.0.0";

        const installers = [
            {
                label: "npm install",
                command: "npm",
                args: ["install", PACKAGE_AT_VERSION, "--ignore-scripts", "--no-audit", "--no-fund"],
                env: undefined
            },
            {
                label: "pnpm add",
                command: "pnpm",
                args: ["add", PACKAGE_AT_VERSION, "--ignore-scripts", "--no-fund"],
                env: undefined
            },
            {
                label: "yarn add",
                command: "yarn",
                args: ["add", PACKAGE_AT_VERSION, "--ignore-scripts"],
                env: { ...process.env, YARN_NODE_LINKER: "node-modules" }
            },
            {
                label: "bun add",
                command: "bun",
                args: ["add", PACKAGE_AT_VERSION],
                env: undefined
            }
        ];

        for (const installer of installers) {
            it(
                `${installer.label} can install and import a module-only package`,
                async () => {
                    const available = await isCommandAvailable(installer.command);
                    if (!available) {
                        console.log(`Skipping: ${installer.command} not available`);
                        return;
                    }

                    const dir = await createTempProjectDir();
                    try {
                        const installResult = await loggingExeca(CONSOLE_LOGGER, installer.command, installer.args, {
                            cwd: dir,
                            doNotPipeOutput: true,
                            reject: false,
                            env: installer.env
                        });

                        expect(installResult.failed).toBe(false);

                        const importResult = await loggingExeca(
                            CONSOLE_LOGGER,
                            "node",
                            ["-e", "console.log(typeof require('is-number'))"],
                            {
                                cwd: dir,
                                doNotPipeOutput: true,
                                reject: false
                            }
                        );

                        expect(importResult.failed).toBe(false);
                        expect(importResult.stdout.trim()).toBe("function");
                    } finally {
                        await rm(dir, { recursive: true, force: true });
                    }
                },
                MODULE_INSTALL_TIMEOUT
            );
        }
    });
});
