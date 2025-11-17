import { runMigrations } from "@fern-api/cli-migrations";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { loggingExeca } from "@fern-api/logging-execa";
import { isVersionAhead } from "@fern-api/semver-utils";
import { writeFile } from "fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../../../cli-context/CliContext";
import { doesVersionOfCliExist } from "../../../cli-context/upgrade-utils/doesVersionOfCliExist";
import { rerunFernCliAtVersion } from "../../../rerunFernCliAtVersion";
import { PREVIOUS_VERSION_ENV_VAR, upgrade } from "../upgrade";

vi.mock("@fern-api/cli-migrations");
vi.mock("@fern-api/configuration-loader");
vi.mock("@fern-api/logging-execa");
vi.mock("@fern-api/semver-utils");
vi.mock("fs/promises");
vi.mock("../../../cli-context/upgrade-utils/doesVersionOfCliExist");
vi.mock("../../../rerunFernCliAtVersion");

describe("upgrade", () => {
    let mockCliContext: CliContext;
    let mockLogger: {
        info: ReturnType<typeof vi.fn>;
        error: ReturnType<typeof vi.fn>;
        warn: ReturnType<typeof vi.fn>;
    };
    let mockRunTask: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockLogger = {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn()
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
            isUpgradeAvailable: vi.fn()
        } as any;

        vi.mocked(runMigrations).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        vi.mocked(loggingExeca).mockResolvedValue(undefined as any);
        vi.mocked(rerunFernCliAtVersion).mockResolvedValue(undefined);
    });

    describe("manual upgrade with --from and --to flags", () => {
        beforeEach(() => {
            vi.mocked(getFernDirectory).mockResolvedValue("/test/fern" as any);
            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "0.84.1",
                rawConfig: { version: "0.84.1" },
                _absolutePath: "/test/fern/fern.config.json"
            } as any);
        });

        it("should install and rerun at target version when not already at target", async () => {
            mockCliContext.environment.packageVersion = "0.84.1";
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(true);
            vi.mocked(isVersionAhead).mockReturnValue(true);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "0.84.1"
            });

            expect(doesVersionOfCliExist).toHaveBeenCalledWith({
                cliEnvironment: mockCliContext.environment,
                version: "1.2.0"
            });
            expect(isVersionAhead).toHaveBeenCalledWith("1.2.0", "0.84.1");
            expect(loggingExeca).toHaveBeenCalledWith(mockLogger, "npm", ["install", "-g", "fern-api@1.2.0"]);
            expect(rerunFernCliAtVersion).toHaveBeenCalledWith({
                version: "1.2.0",
                cliContext: mockCliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "0.84.1"
                },
                args: ["upgrade", "--from", "0.84.1", "--to", "1.2.0"]
            });
            expect(runMigrations).not.toHaveBeenCalled();
            expect(writeFile).not.toHaveBeenCalled();
        });

        it("should run migrations directly when already at target version", async () => {
            mockCliContext.environment.packageVersion = "1.2.0";

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "0.84.1"
            });

            expect(loggingExeca).not.toHaveBeenCalled();
            expect(rerunFernCliAtVersion).not.toHaveBeenCalled();
            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.84.1",
                toVersion: "1.2.0",
                context: {}
            });
            expect(writeFile).toHaveBeenCalledWith(
                "/test/fern/fern.config.json",
                expect.stringContaining('"version": "1.2.0"')
            );
        });

        it("should throw when target version does not exist", async () => {
            mockCliContext.environment.packageVersion = "0.84.1";
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(false);

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "99.99.99",
                    fromVersion: "0.84.1"
                })
            ).rejects.toThrow("Failed to upgrade to 99.99.99 because it does not exist");

            expect(loggingExeca).not.toHaveBeenCalled();
            expect(rerunFernCliAtVersion).not.toHaveBeenCalled();
        });

        it("should throw when target version is not ahead of current", async () => {
            mockCliContext.environment.packageVersion = "1.2.0";
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(true);
            vi.mocked(isVersionAhead).mockReturnValue(false);

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "0.84.1",
                    fromVersion: "0.84.1"
                })
            ).rejects.toThrow("Cannot upgrade because target version (0.84.1) is not ahead of existing version 1.2.0");

            expect(loggingExeca).not.toHaveBeenCalled();
            expect(rerunFernCliAtVersion).not.toHaveBeenCalled();
        });

        it("should write config after migrations when at target version", async () => {
            mockCliContext.environment.packageVersion = "1.2.0";

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "0.84.1"
            });

            const runMigrationsCall = vi.mocked(runMigrations).mock.calls[0];
            const writeFileCall = vi.mocked(writeFile).mock.calls[0];

            expect(runMigrationsCall).toBeDefined();
            expect(writeFileCall).toBeDefined();

            const runMigrationsCallOrder =
                vi.mocked(runMigrations).mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER;
            const writeFileCallOrder = vi.mocked(writeFile).mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER;

            expect(runMigrationsCallOrder).toBeLessThan(writeFileCallOrder);
        });

        it("should handle local-dev (0.0.0) with manual flags by installing and rerunning", async () => {
            mockCliContext.environment.packageVersion = "0.0.0";
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(true);
            vi.mocked(isVersionAhead).mockReturnValue(true);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "0.84.1"
            });

            expect(loggingExeca).toHaveBeenCalledWith(mockLogger, "npm", ["install", "-g", "fern-api@1.2.0"]);
            expect(rerunFernCliAtVersion).toHaveBeenCalledWith({
                version: "1.2.0",
                cliContext: mockCliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "0.84.1"
                },
                args: ["upgrade", "--from", "0.84.1", "--to", "1.2.0"]
            });
        });
    });

    describe("re-run scenario with PREVIOUS_VERSION_ENV_VAR", () => {
        beforeEach(() => {
            vi.mocked(getFernDirectory).mockResolvedValue("/test/fern" as any);
            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "1.2.0",
                rawConfig: { version: "1.2.0" },
                _absolutePath: "/test/fern/fern.config.json"
            } as any);
            mockCliContext.environment.packageVersion = "1.2.0";
        });

        it("should run migrations when PREVIOUS_VERSION_ENV_VAR is set", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "0.84.1";

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: undefined,
                fromVersion: undefined
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "0.84.1",
                toVersion: "1.2.0",
                context: {}
            });
            expect(writeFile).toHaveBeenCalledWith(
                "/test/fern/fern.config.json",
                expect.stringContaining('"version": "1.2.0"')
            );

            delete process.env[PREVIOUS_VERSION_ENV_VAR];
        });

        it("should not enter migration mode when PREVIOUS_VERSION_ENV_VAR is set but packageVersion is 0.0.0 without explicit --to", async () => {
            process.env[PREVIOUS_VERSION_ENV_VAR] = "0.84.1";
            mockCliContext.environment.packageVersion = "0.0.0";
            mockCliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: null
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: undefined,
                fromVersion: undefined
            });

            expect(runMigrations).not.toHaveBeenCalled();

            delete process.env[PREVIOUS_VERSION_ENV_VAR];
        });
    });

    describe("normal upgrade flow", () => {
        beforeEach(() => {
            vi.mocked(getFernDirectory).mockResolvedValue("/test/fern" as any);
            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "1.0.0",
                rawConfig: { version: "1.0.0" },
                _absolutePath: "/test/fern/fern.config.json"
            } as any);
            mockCliContext.environment.packageVersion = "1.0.0";
        });

        it("should install and rerun with explicit flags for normal upgrade", async () => {
            mockCliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "1.2.0",
                    isUpgradeAvailable: true
                }
            });

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: undefined,
                fromVersion: undefined
            });

            expect(loggingExeca).toHaveBeenCalledWith(mockLogger, "npm", ["install", "-g", "fern-api@1.2.0"]);
            expect(rerunFernCliAtVersion).toHaveBeenCalledWith({
                version: "1.2.0",
                cliContext: mockCliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "1.0.0"
                },
                args: ["upgrade", "--from", "1.0.0", "--to", "1.2.0"]
            });
        });

        it("should handle local-dev (0.0.0) by running migrations directly", async () => {
            mockCliContext.environment.packageVersion = "0.0.0";
            mockCliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "1.2.0",
                    isUpgradeAvailable: true
                }
            });
            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "1.0.0",
                rawConfig: { version: "1.0.0" },
                _absolutePath: "/test/fern/fern.config.json"
            } as any);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: undefined,
                fromVersion: undefined
            });

            expect(runMigrations).toHaveBeenCalledWith({
                fromVersion: "1.0.0",
                toVersion: "1.2.0",
                context: {}
            });
            expect(writeFile).toHaveBeenCalledWith(
                "/test/fern/fern.config.json",
                expect.stringContaining('"version": "1.2.0"')
            );
            expect(loggingExeca).not.toHaveBeenCalled();
            expect(rerunFernCliAtVersion).not.toHaveBeenCalled();
        });

        it("should print 'No upgrade available' when already at latest version", async () => {
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
            expect(loggingExeca).not.toHaveBeenCalled();
            expect(rerunFernCliAtVersion).not.toHaveBeenCalled();
        });
    });

    describe("edge cases", () => {
        beforeEach(() => {
            vi.mocked(getFernDirectory).mockResolvedValue("/test/fern" as any);
            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "1.0.0",
                rawConfig: { version: "1.0.0" },
                _absolutePath: "/test/fern/fern.config.json"
            } as any);
        });

        it("should handle missing fern directory gracefully in migration mode", async () => {
            mockCliContext.environment.packageVersion = "1.2.0";
            vi.mocked(getFernDirectory).mockResolvedValue(undefined);

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "0.84.1"
            });

            expect(runMigrations).toHaveBeenCalled();
            expect(writeFile).not.toHaveBeenCalled();
        });

        it("should validate target version in normal upgrade flow", async () => {
            mockCliContext.environment.packageVersion = "1.0.0";
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(false);

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "99.99.99",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Failed to upgrade to 99.99.99 because it does not exist");
        });
    });
});
