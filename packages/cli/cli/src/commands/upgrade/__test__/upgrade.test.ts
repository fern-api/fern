import { runMigrations } from "@fern-api/cli-migrations";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { isVersionAhead } from "@fern-api/semver-utils";
import { writeFile } from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../../../cli-context/CliContext";
import { RerunCliError, rerunFernCliAtVersion } from "../../../rerunFernCliAtVersion";
import { PREVIOUS_VERSION_ENV_VAR, upgrade } from "../upgrade";

vi.mock("@fern-api/cli-migrations");
vi.mock("@fern-api/configuration-loader");
vi.mock("@fern-api/semver-utils");
vi.mock("fs/promises");
vi.mock("@fern-api/logging-execa");
vi.mock("../../../rerunFernCliAtVersion", async () => {
    const actual = await vi.importActual<typeof import("../../../rerunFernCliAtVersion")>(
        "../../../rerunFernCliAtVersion"
    );
    return {
        ...actual,
        rerunFernCliAtVersion: vi.fn()
    };
});

describe("upgrade", () => {
    let mockCliContext: CliContext;
    let mockLogger: {
        info: ReturnType<typeof vi.fn>;
        error: ReturnType<typeof vi.fn>;
        warn: ReturnType<typeof vi.fn>;
        debug: ReturnType<typeof vi.fn>;
    };
    let mockRunTask: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env[PREVIOUS_VERSION_ENV_VAR];

        mockLogger = {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn()
        };

        mockRunTask = vi.fn(async (fn: (context: unknown) => Promise<unknown>) => {
            if (typeof fn === "function") {
                return await fn({});
            }
            return {};
        });

        mockCliContext = {
            logger: mockLogger,
            environment: {
                packageVersion: "1.0.0",
                packageName: "fern-api"
            },
            runTask: mockRunTask,
            failAndThrow: vi.fn((message: string) => {
                throw new Error(message);
            }),
            exitIfFailed: vi.fn(),
            isUpgradeAvailable: vi.fn(),
            suppressUpgradeMessage: vi.fn(),
            failWithoutThrowing: vi.fn()
        } as unknown as CliContext;

        vi.mocked(runMigrations).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        vi.mocked(rerunFernCliAtVersion).mockResolvedValue(undefined);
        vi.mocked(getFernDirectory).mockResolvedValue("/test/fern" as AbsoluteFilePath);
        vi.mocked(loadProjectConfig).mockResolvedValue({
            version: "1.0.0",
            rawConfig: { version: "1.0.0", organization: "test-org" },
            _absolutePath: "/test/fern/fern.config.json" as AbsoluteFilePath,
            organization: "test-org"
        });
    });

    afterEach(() => {
        delete process.env[PREVIOUS_VERSION_ENV_VAR];
    });

    describe("when current CLI version !== target version", () => {
        let originalArgv: string[];

        beforeEach(() => {
            vi.mocked(isVersionAhead).mockReturnValue(true);
            mockCliContext.environment.packageVersion = "1.0.0";
            originalArgv = process.argv;
        });

        afterEach(() => {
            process.argv = originalArgv;
        });

        it("should rerun with --from and --to flags", async () => {
            process.argv = ["node", "cli.js", "upgrade", "--version", "1.2.0"];

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(rerunFernCliAtVersion).toHaveBeenCalledWith({
                version: "1.2.0",
                cliContext: mockCliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "1.0.0"
                },
                args: ["upgrade", "--from", "1.0.0", "--to", "1.2.0"],
                throwOnError: true
            });
            expect(runMigrations).not.toHaveBeenCalled();
            expect(writeFile).not.toHaveBeenCalled();
        });

        it("should use explicit --from flag when provided", async () => {
            process.argv = ["node", "cli.js", "upgrade", "--version", "1.2.0", "--from", "0.84.1"];

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "0.84.1"
            });

            expect(rerunFernCliAtVersion).toHaveBeenCalledWith({
                version: "1.2.0",
                cliContext: mockCliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "0.84.1"
                },
                args: ["upgrade", "--from", "0.84.1", "--to", "1.2.0"],
                throwOnError: true
            });
        });

        it("should preserve additional flags like --rc when rerunning", async () => {
            process.argv = ["node", "cli.js", "upgrade", "--rc", "--version", "1.2.0"];

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: true,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(rerunFernCliAtVersion).toHaveBeenCalledWith({
                version: "1.2.0",
                cliContext: mockCliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "1.0.0"
                },
                args: ["upgrade", "--from", "1.0.0", "--to", "1.2.0", "--rc"],
                throwOnError: true
            });
        });

        it("should preserve unknown future flags when rerunning", async () => {
            process.argv = ["node", "cli.js", "upgrade", "--version", "1.2.0", "--some-future-flag", "value"];

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(rerunFernCliAtVersion).toHaveBeenCalledWith({
                version: "1.2.0",
                cliContext: mockCliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "1.0.0"
                },
                args: ["upgrade", "--from", "1.0.0", "--to", "1.2.0", "--some-future-flag", "value"],
                throwOnError: true
            });
        });

        it("should handle boolean flags correctly (true values included, false values omitted)", async () => {
            // Simulate process.argv with various boolean flags
            process.argv = [
                "node",
                "cli.js",
                "upgrade",
                "--version",
                "1.2.0",
                "--some-true-flag", // Boolean true flag
                "--some-false-flag=false", // Boolean false flag (yargs parses this as string "false")
                "--another-true-flag" // Another boolean true flag
            ];

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            const rerunCall = vi.mocked(rerunFernCliAtVersion).mock.calls[0]?.[0];
            expect(rerunCall?.args).toEqual(expect.arrayContaining(["--some-true-flag", "--another-true-flag"]));
            // false boolean flags should NOT be in the args
            expect(rerunCall?.args).not.toContain("--some-false-flag");
            expect(rerunCall?.args).not.toContain("false");
        });

        it("should preserve string flag values (including other values like 'true')", async () => {
            process.argv = [
                "node",
                "cli.js",
                "upgrade",
                "--version",
                "1.2.0",
                "--string-value",
                "some-string",
                "--number-value",
                "42"
            ];

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            const rerunCall = vi.mocked(rerunFernCliAtVersion).mock.calls[0]?.[0];
            expect(rerunCall?.args).toEqual(
                expect.arrayContaining(["--string-value", "some-string", "--number-value", "42"])
            );
        });

        it("should skip rerun for local-dev (0.0.0) and run migrations directly", async () => {
            mockCliContext.environment.packageVersion = "0.0.0";

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(rerunFernCliAtVersion).not.toHaveBeenCalled();
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "1.0.0",
                toVersion: "1.2.0",
                context: {}
            });
            expect(writeFile).toHaveBeenCalled();
        });
    });

    describe("when current CLI version === target version", () => {
        beforeEach(() => {
            mockCliContext.environment.packageVersion = "1.2.0";
            vi.mocked(isVersionAhead).mockReturnValue(true);
        });

        it("should run migrations and update config", async () => {
            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "1.0.0"
            });

            expect(rerunFernCliAtVersion).not.toHaveBeenCalled();
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "1.0.0",
                toVersion: "1.2.0",
                context: {}
            });
            expect(writeFile).toHaveBeenCalledWith(
                "/test/fern/fern.config.json",
                expect.stringContaining('"version": "1.2.0"')
            );
        });

        it("should use PREVIOUS_VERSION_ENV_VAR if --from not provided", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "0.84.1";

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.84.1",
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should fall back to project config version if no --from or env var", async () => {
            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "1.0.0",
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should update config after migrations complete", async () => {
            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "1.0.0"
            });

            const runMigrationsCallOrder =
                vi.mocked(runMigrations).mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER;
            const writeFileCallOrder = vi.mocked(writeFile).mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER;

            expect(runMigrationsCallOrder).toBeLessThan(writeFileCallOrder);
        });
    });

    describe("target version resolution", () => {
        beforeEach(() => {
            vi.mocked(isVersionAhead).mockReturnValue(true);
        });

        it("should use explicit --version flag", async () => {
            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.5.0",
                fromVersion: undefined
            });

            expect(mockCliContext.isUpgradeAvailable).not.toHaveBeenCalled();
            expect(rerunFernCliAtVersion).toHaveBeenCalledWith(expect.objectContaining({ version: "1.5.0" }));
        });

        it("should fetch latest version when no --version provided", async () => {
            mockCliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "1.3.0",
                    isUpgradeAvailable: true
                }
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: undefined,
                fromVersion: undefined
            });

            expect(mockCliContext.isUpgradeAvailable).toHaveBeenCalledWith({ includePreReleases: false });
            expect(rerunFernCliAtVersion).toHaveBeenCalledWith(expect.objectContaining({ version: "1.3.0" }));
        });

        it("should print 'No upgrade available' when already at latest", async () => {
            mockCliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "1.0.0",
                    isUpgradeAvailable: false
                }
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: undefined,
                fromVersion: undefined
            });

            expect(mockLogger.info).toHaveBeenCalledWith("No upgrade available.");
            expect(rerunFernCliAtVersion).not.toHaveBeenCalled();
            expect(runMigrations).not.toHaveBeenCalled();
        });

        it("should run migrations when no upgrade available but config version differs from CLI version", async () => {
            mockCliContext.environment.packageVersion = "1.3.0-rc0";
            mockCliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "1.3.0-rc0",
                    isUpgradeAvailable: false
                }
            });
            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "0.84.1", // Different from CLI version
                rawConfig: { version: "0.84.1", organization: "test-org" },
                _absolutePath: "/test/fern/fern.config.json" as AbsoluteFilePath,
                organization: "test-org"
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: true,
                targetVersion: undefined,
                fromVersion: undefined
            });

            expect(mockLogger.info).toHaveBeenCalledWith(
                "No newer version available, but config version (0.84.1) differs from CLI version (1.3.0-rc0)"
            );
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.84.1",
                toVersion: "1.3.0-rc0",
                context: {}
            });
            expect(writeFile).toHaveBeenCalledWith(
                "/test/fern/fern.config.json",
                expect.stringContaining('"version": "1.3.0-rc0"')
            );
        });
    });

    describe("version validation", () => {
        it("should throw when target version is not ahead of current", async () => {
            vi.mocked(isVersionAhead).mockReturnValue(false);

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "0.5.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Cannot upgrade because target version (0.5.0) is not ahead of existing version 1.0.0");
        });

        it("should pass upgrade context to rerunFernCliAtVersion", async () => {
            vi.mocked(isVersionAhead).mockReturnValue(true);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(rerunFernCliAtVersion).toHaveBeenCalledWith(
                expect.objectContaining({
                    throwOnError: true
                })
            );
        });
    });

    describe("edge cases", () => {
        it("should throw when fern directory is missing", async () => {
            vi.mocked(getFernDirectory).mockResolvedValue(undefined);
            vi.mocked(isVersionAhead).mockReturnValue(true);

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow('Directory "fern" not found');
        });
    });

    describe("error handling for rerun failures", () => {
        beforeEach(() => {
            vi.mocked(isVersionAhead).mockReturnValue(true);
        });

        it("should log debug output and throw helpful message for ETARGET error", async () => {
            vi.mocked(rerunFernCliAtVersion).mockRejectedValue(
                new RerunCliError({
                    version: "1.2.0",
                    stdout: "",
                    stderr: "npm ERR! code ETARGET\nnpm ERR! notarget No matching version found for fern-api@1.2.0"
                })
            );

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow(
                "Failed to upgrade to 1.2.0 because it does not exist. See https://www.npmjs.com/package/fern-api?activeTab=versions."
            );

            // Verify debug logging was called
            expect(mockLogger.debug).toHaveBeenCalledWith("Rerun CLI failed with stdout: ");
            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Rerun CLI failed with stderr: npm ERR! code ETARGET")
            );
        });

        it("should detect E404 error pattern", async () => {
            vi.mocked(rerunFernCliAtVersion).mockRejectedValue(
                new RerunCliError({
                    version: "1.2.0",
                    stdout: "",
                    stderr: "npm ERR! code E404\nnpm ERR! 404 Not Found - GET https://registry.npmjs.org/fern-api"
                })
            );

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Failed to upgrade to 1.2.0 because it does not exist");
        });

        it('should detect "404 Not Found" error pattern in stdout', async () => {
            vi.mocked(rerunFernCliAtVersion).mockRejectedValue(
                new RerunCliError({
                    version: "1.2.0",
                    stdout: "404 Not Found - GET https://registry.npmjs.org/fern-api/-/fern-api-1.2.0.tgz",
                    stderr: ""
                })
            );

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Failed to upgrade to 1.2.0 because it does not exist");
        });

        it('should detect "No matching version found" error pattern', async () => {
            vi.mocked(rerunFernCliAtVersion).mockRejectedValue(
                new RerunCliError({
                    version: "1.2.0",
                    stdout: "",
                    stderr: "No matching version found for fern-api@1.2.0"
                })
            );

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Failed to upgrade to 1.2.0 because it does not exist");
        });

        it('should detect "version not found" error pattern', async () => {
            vi.mocked(rerunFernCliAtVersion).mockRejectedValue(
                new RerunCliError({
                    version: "1.2.0",
                    stdout: "version not found: 1.2.0",
                    stderr: ""
                })
            );

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Failed to upgrade to 1.2.0 because it does not exist");
        });

        it("should rethrow RerunCliError for non-version-not-found errors", async () => {
            vi.mocked(rerunFernCliAtVersion).mockRejectedValue(
                new RerunCliError({
                    version: "1.2.0",
                    stdout: "",
                    stderr: "npm ERR! network timeout"
                })
            );

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Failed to rerun CLI at version 1.2.0");

            // Should still log debug output
            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Rerun CLI failed with stderr: npm ERR! network timeout")
            );
        });

        it("should rethrow non-RerunCliError errors without special handling", async () => {
            const genericError = new Error("Some other error");
            vi.mocked(rerunFernCliAtVersion).mockRejectedValue(genericError);

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Some other error");

            // Should not log debug output for non-RerunCliError
            expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining("Rerun CLI failed"));
        });

        it("should handle undefined stdout/stderr gracefully", async () => {
            const errorWithUndefined = new RerunCliError({
                version: "1.2.0",
                stdout: "",
                stderr: ""
            });
            vi.mocked(rerunFernCliAtVersion).mockRejectedValue(errorWithUndefined);

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "1.2.0",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Failed to rerun CLI at version 1.2.0");

            // Should still call debug logging
            expect(mockLogger.debug).toHaveBeenCalled();
        });
    });

    describe("faulty upgrade detection", () => {
        beforeEach(() => {
            mockCliContext.environment.packageVersion = "1.2.0";
        });

        it("should detect faulty upgrade when FERN_PRE_UPGRADE_VERSION equals current CLI version", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0"; // Same as current version - indicates faulty upgrade

            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: '{"version":"0.84.1"}',
                stderr: ""
            } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Detected faulty upgrade (FERN_PRE_UPGRADE_VERSION=1.2.0)")
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("0.84.1"));
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.84.1",
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should use git fallback when FERN_PRE_UPGRADE_VERSION equals current version", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0";

            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: '{"version":"0.80.0"}',
                stderr: ""
            } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.80.0",
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should show specific error when not a git repository", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0"; // Faulty upgrade detected

            // Mock git command failing (not a git repo)
            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: "",
                stderr: "",
                failed: true
            } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("not a git repository"));
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "1.0.0", // Falls back to projectConfig.version
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should show specific error when config not tracked by git", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0";

            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/project/root\n",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "", // Empty = file not tracked
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining("fern.config.json not tracked by git")
            );
        });

        it("should show specific error when no git history exists", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0";

            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/project/root\n",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "fern.config.json\n",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true // git show failed
                } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining("no git history for fern.config.json")
            );
        });

        it("should show specific error when config missing version field", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0";

            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/project/root\n",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "fern.config.json\n",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: '{"organization":"test"}', // No version field
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining("no version field in fern.config.json")
            );
        });

        it("should show specific error when JSON parse fails", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0";

            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/project/root\n",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "fern.config.json\n",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "invalid json{", // Malformed JSON
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining("failed to parse fern.config.json from git")
            );
        });

        it("should retrieve version from git for any fern.config.json location", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0";

            // Mock sequential git commands: get root, find config, retrieve content
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/project/root\n",
                    stderr: ""
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "custom/path/fern.config.json\n",
                    stderr: ""
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: '{"version":"0.75.0"}',
                    stderr: ""
                } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.75.0",
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should not trigger git fallback when FERN_PRE_UPGRADE_VERSION is different from current version", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.0.0"; // Different from current version (1.2.0)

            vi.mocked(loggingExeca).mockImplementation(async () => {
                throw new Error("Git should not be called");
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining("Detected faulty upgrade"));
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "1.0.0",
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should use explicit --from flag even when faulty upgrade detected", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.2.0"; // Faulty upgrade

            vi.mocked(loggingExeca).mockImplementation(async () => {
                throw new Error("Git should not be called when --from is explicit");
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "0.90.0" // Explicit --from flag
            });

            expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining("Detected faulty upgrade"));
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.90.0",
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should not trigger git fallback for local dev (0.0.0)", async () => {
            mockCliContext.environment.packageVersion = "0.0.0"; // Local dev
            process.env[PREVIOUS_VERSION_ENV_VAR] = "0.0.0";

            vi.mocked(loggingExeca).mockImplementation(async () => {
                throw new Error("Git should not be called for local dev");
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining("Detected faulty upgrade"));
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "1.0.0", // Uses projectConfig.version
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should apply faulty upgrade detection when rerunning at different version", async () => {
            mockCliContext.environment.packageVersion = "1.0.0"; // Different from target
            process.env[PREVIOUS_VERSION_ENV_VAR] = "1.0.0"; // Faulty upgrade detected
            vi.mocked(isVersionAhead).mockReturnValue(true);

            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: '{"version":"0.85.0"}',
                stderr: ""
            } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(rerunFernCliAtVersion).toHaveBeenCalledWith({
                version: "1.2.0",
                cliContext: mockCliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "0.85.0"
                },
                args: ["upgrade", "--from", "0.85.0", "--to", "1.2.0"],
                throwOnError: true
            });
        });
    });

    describe("--from-git flag", () => {
        beforeEach(() => {
            mockCliContext.environment.packageVersion = "0.0.0"; // Local dev
        });

        it("should retrieve version from git when --from-git flag is set", async () => {
            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: '{"version":"0.85.0"}',
                stderr: ""
            } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined,
                fromGit: true
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.85.0",
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should not log faulty upgrade message when using --from-git", async () => {
            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: '{"version":"0.85.0"}',
                stderr: ""
            } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined,
                fromGit: true
            });

            expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining("Detected faulty upgrade"));
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it("should ignore env var when --from-git is set", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "0.90.0"; // This should be ignored
            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: '{"version":"0.85.0"}',
                stderr: ""
            } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined,
                fromGit: true
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.85.0", // From git, not from env var
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should fall back to projectConfig.version when git fails with --from-git", async () => {
            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: "",
                stderr: "",
                failed: true
            } as loggingExeca.ReturnValue);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined,
                fromGit: true
            });

            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Could not retrieve version from git")
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("not a git repository"));
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "1.0.0", // Falls back to projectConfig.version
                toVersion: "1.2.0",
                context: {}
            });
        });

        it("should respect explicit --from flag even when --from-git is set", async () => {
            vi.mocked(loggingExeca).mockImplementation(async () => {
                throw new Error("Git should not be called when --from is explicit");
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "0.80.0", // Explicit --from flag
                fromGit: true
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.80.0", // Uses explicit --from, not git
                toVersion: "1.2.0",
                context: {}
            });
        });
    });
});
