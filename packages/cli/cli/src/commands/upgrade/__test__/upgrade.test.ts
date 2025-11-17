import { runMigrations } from "@fern-api/cli-migrations";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { loggingExeca } from "@fern-api/logging-execa";
import { isVersionAhead } from "@fern-api/semver-utils";
import { writeFile } from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
        delete process.env[PREVIOUS_VERSION_ENV_VAR];

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
        vi.mocked(getFernDirectory).mockResolvedValue("/test/fern" as any);
        vi.mocked(loadProjectConfig).mockResolvedValue({
            version: "1.0.0",
            rawConfig: { version: "1.0.0" },
            _absolutePath: "/test/fern/fern.config.json"
        } as any);
    });

    afterEach(() => {
        delete process.env[PREVIOUS_VERSION_ENV_VAR];
    });

    describe("when current CLI version !== target version", () => {
        let originalArgv: string[];

        beforeEach(() => {
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(true);
            vi.mocked(isVersionAhead).mockReturnValue(true);
            mockCliContext.environment.packageVersion = "1.0.0";
            originalArgv = process.argv;
        });

        afterEach(() => {
            process.argv = originalArgv;
        });

        it("should install target version and rerun with --from and --to flags", async () => {
            process.argv = ["node", "cli.js", "upgrade", "--version", "1.2.0"];

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
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
                args: ["upgrade", "--from", "0.84.1", "--to", "1.2.0"]
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
                args: ["upgrade", "--from", "1.0.0", "--to", "1.2.0", "--rc"]
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
                args: ["upgrade", "--from", "1.0.0", "--to", "1.2.0", "--some-future-flag", "value"]
            });
        });

        it("should skip install and rerun for local-dev (0.0.0) and run migrations directly", async () => {
            mockCliContext.environment.packageVersion = "0.0.0";

            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: undefined
            });

            expect(loggingExeca).not.toHaveBeenCalled();
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
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(true);
            vi.mocked(isVersionAhead).mockReturnValue(true);
        });

        it("should run migrations and update config", async () => {
            await upgrade({
                cliContext: mockCliContext,
                includePreReleases: false,
                targetVersion: "1.2.0",
                fromVersion: "1.0.0"
            });

            expect(loggingExeca).not.toHaveBeenCalled();
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
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(true);
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
            expect(loggingExeca).toHaveBeenCalledWith(mockLogger, "npm", ["install", "-g", "fern-api@1.5.0"]);
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
            expect(loggingExeca).toHaveBeenCalledWith(mockLogger, "npm", ["install", "-g", "fern-api@1.3.0"]);
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
            expect(loggingExeca).not.toHaveBeenCalled();
            expect(runMigrations).not.toHaveBeenCalled();
        });
    });

    describe("version validation", () => {
        it("should throw when target version does not exist", async () => {
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(false);

            await expect(
                upgrade({
                    cliContext: mockCliContext,
                    includePreReleases: false,
                    targetVersion: "99.99.99",
                    fromVersion: undefined
                })
            ).rejects.toThrow("Failed to upgrade to 99.99.99 because it does not exist");

            expect(loggingExeca).not.toHaveBeenCalled();
        });

        it("should throw when target version is not ahead of current", async () => {
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(true);
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
    });

    describe("edge cases", () => {
        it("should throw when fern directory is missing", async () => {
            vi.mocked(getFernDirectory).mockResolvedValue(undefined);
            vi.mocked(doesVersionOfCliExist).mockResolvedValue(true);
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
});
