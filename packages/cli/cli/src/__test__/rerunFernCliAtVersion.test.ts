import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../cli-context/CliContext.js";
import { RerunCliError, rerunFernCliAtVersion } from "../rerunFernCliAtVersion.js";

vi.mock("@fern-api/logging-execa");
vi.mock("../utils/packageManagerRunner", async () => {
    const actual = await vi.importActual<typeof import("../utils/packageManagerRunner")>(
        "../utils/packageManagerRunner"
    );
    return {
        ...actual,
        detectPackageManagerRunner: vi.fn()
    };
});

import type { PackageManagerRunner } from "../utils/packageManagerRunner.js";
import { detectPackageManagerRunner } from "../utils/packageManagerRunner.js";

describe("rerunFernCliAtVersion", () => {
    let mockCliContext: CliContext;
    const mockLogger: Logger = {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockCliContext = {
            logger: mockLogger,
            environment: {
                packageVersion: "1.0.0",
                packageName: "fern-api"
            },
            suppressUpgradeMessage: vi.fn(),
            failAndThrow: vi.fn((message: string) => {
                throw new Error(message);
            }),
            failWithoutThrowing: vi.fn()
        } as unknown as CliContext;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("package manager runner detection", () => {
        it("should use npx when detected", async () => {
            const npmRunner: PackageManagerRunner = {
                type: "npm",
                command: "npx",
                buildArgs: (pkg: string, args: string[]) => ["--quiet", "--yes", pkg, ...args],
                label: "npx (npm)"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(npmRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                args: ["upgrade"]
            });

            expect(vi.mocked(loggingExeca).mock.calls[0]?.[1]).toBe("npx");
            expect(vi.mocked(loggingExeca).mock.calls[0]?.[2]).toEqual([
                "--quiet",
                "--yes",
                "fern-api@1.2.3",
                "upgrade"
            ]);
        });

        it("should use pnpm dlx when detected", async () => {
            const pnpmRunner: PackageManagerRunner = {
                type: "pnpm",
                command: "pnpm",
                buildArgs: (pkg: string, args: string[]) => ["dlx", pkg, ...args],
                label: "pnpm dlx"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(pnpmRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                args: ["upgrade"]
            });

            expect(vi.mocked(loggingExeca).mock.calls[0]?.[1]).toBe("pnpm");
            expect(vi.mocked(loggingExeca).mock.calls[0]?.[2]).toEqual(["dlx", "fern-api@1.2.3", "upgrade"]);
        });

        it("should use yarn dlx when detected", async () => {
            const yarnRunner: PackageManagerRunner = {
                type: "yarn",
                command: "yarn",
                buildArgs: (pkg: string, args: string[]) => ["dlx", pkg, ...args],
                label: "yarn dlx"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(yarnRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                args: ["upgrade"]
            });

            expect(vi.mocked(loggingExeca).mock.calls[0]?.[1]).toBe("yarn");
            expect(vi.mocked(loggingExeca).mock.calls[0]?.[2]).toEqual(["dlx", "fern-api@1.2.3", "upgrade"]);
        });

        it("should use bunx when detected", async () => {
            const bunRunner: PackageManagerRunner = {
                type: "bun",
                command: "bunx",
                buildArgs: (pkg: string, args: string[]) => [pkg, ...args],
                label: "bunx (bun)"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(bunRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                args: ["upgrade"]
            });

            expect(vi.mocked(loggingExeca).mock.calls[0]?.[1]).toBe("bunx");
            expect(vi.mocked(loggingExeca).mock.calls[0]?.[2]).toEqual(["fern-api@1.2.3", "upgrade"]);
        });

        it("should use deno when detected", async () => {
            const denoRunner: PackageManagerRunner = {
                type: "deno",
                command: "deno",
                buildArgs: (pkg: string, args: string[]) => ["run", "-A", `npm:${pkg}`, ...args],
                label: "deno run"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(denoRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                args: ["upgrade"]
            });

            expect(vi.mocked(loggingExeca).mock.calls[0]?.[1]).toBe("deno");
            expect(vi.mocked(loggingExeca).mock.calls[0]?.[2]).toEqual(["run", "-A", "npm:fern-api@1.2.3", "upgrade"]);
        });
    });

    describe("when no package manager is available", () => {
        it("should fail with descriptive error when throwOnError is true", async () => {
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(undefined);

            await expect(
                rerunFernCliAtVersion({
                    version: "1.2.3",
                    cliContext: mockCliContext,
                    throwOnError: true
                })
            ).rejects.toThrow(RerunCliError);

            await expect(
                rerunFernCliAtVersion({
                    version: "1.2.3",
                    cliContext: mockCliContext,
                    throwOnError: true
                })
            ).rejects.toThrow("Failed to rerun CLI at version 1.2.3");
        });

        it("should call failAndThrow when throwOnError is false", async () => {
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(undefined);

            await expect(
                rerunFernCliAtVersion({
                    version: "1.2.3",
                    cliContext: mockCliContext,
                    throwOnError: false
                })
            ).rejects.toThrow("No supported package manager runner found");
        });
    });

    describe("EEXIST retry", () => {
        it("should retry on EEXIST error in stdout", async () => {
            const npmRunner: PackageManagerRunner = {
                type: "npm",
                command: "npx",
                buildArgs: (pkg: string, args: string[]) => ["--quiet", "--yes", pkg, ...args],
                label: "npx (npm)"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(npmRunner);
            vi.mocked(loggingExeca)
                // First attempt: EEXIST
                .mockResolvedValueOnce({
                    stdout: "npm ERR! code EEXIST",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // Second attempt: success
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                args: ["upgrade"]
            });

            // Should have been called twice (original + retry)
            expect(vi.mocked(loggingExeca)).toHaveBeenCalledTimes(2);
        });
    });

    describe("error handling", () => {
        it("should throw RerunCliError when execution fails and throwOnError is true", async () => {
            const npmRunner: PackageManagerRunner = {
                type: "npm",
                command: "npx",
                buildArgs: (pkg: string, args: string[]) => ["--quiet", "--yes", pkg, ...args],
                label: "npx (npm)"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(npmRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "some error",
                failed: true
            } as loggingExeca.ReturnValue);

            await expect(
                rerunFernCliAtVersion({
                    version: "1.2.3",
                    cliContext: mockCliContext,
                    throwOnError: true,
                    args: ["upgrade"]
                })
            ).rejects.toThrow(RerunCliError);
        });

        it("should call failWithoutThrowing when execution fails and throwOnError is false", async () => {
            const npmRunner: PackageManagerRunner = {
                type: "npm",
                command: "npx",
                buildArgs: (pkg: string, args: string[]) => ["--quiet", "--yes", pkg, ...args],
                label: "npx (npm)"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(npmRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "some error",
                failed: true
            } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                throwOnError: false,
                args: ["upgrade"]
            });

            expect(mockCliContext.failWithoutThrowing).toHaveBeenCalled();
        });
    });

    describe("debug logging", () => {
        it("should log the runner being used", async () => {
            const pnpmRunner: PackageManagerRunner = {
                type: "pnpm",
                command: "pnpm",
                buildArgs: (pkg: string, args: string[]) => ["dlx", pkg, ...args],
                label: "pnpm dlx"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(pnpmRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                args: ["upgrade"]
            });

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("pnpm dlx"));
            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("1.2.3"));
        });
    });

    describe("environment variables", () => {
        it("should pass env variables through to the executed command", async () => {
            const npmRunner: PackageManagerRunner = {
                type: "npm",
                command: "npx",
                buildArgs: (pkg: string, args: string[]) => ["--quiet", "--yes", pkg, ...args],
                label: "npx (npm)"
            };
            vi.mocked(detectPackageManagerRunner).mockResolvedValue(npmRunner);
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await rerunFernCliAtVersion({
                version: "1.2.3",
                cliContext: mockCliContext,
                env: { MY_VAR: "my-value" },
                args: ["upgrade"]
            });

            const execaOptions = vi.mocked(loggingExeca).mock.calls[0]?.[3] as Record<string, unknown>;
            const envVars = execaOptions?.env as Record<string, string>;
            expect(envVars?.MY_VAR).toBe("my-value");
            expect(envVars?.FERN_NO_VERSION_REDIRECTION).toBe("true");
        });
    });
});
