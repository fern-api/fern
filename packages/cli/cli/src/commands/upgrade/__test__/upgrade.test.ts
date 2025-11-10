import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { loggingExeca } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockCliContext } from "../../../__test__/mockCliContext";
import { rerunFernCliAtVersion } from "../../../rerunFernCliAtVersion";
import { PREVIOUS_VERSION_ENV_VAR, upgrade } from "../upgrade";

vi.mock("@fern-api/configuration-loader");
vi.mock("@fern-api/logging-execa");
vi.mock("fs/promises");
vi.mock("../../../rerunFernCliAtVersion");

describe("upgrade command", () => {
    let cliContext: MockCliContext;
    const testFernDirectory = "/test/project/fern";
    const testConfigPath = "/test/project/fern/fern.config.json";

    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env[PREVIOUS_VERSION_ENV_VAR];

        cliContext = new MockCliContext();

        vi.mocked(getFernDirectory).mockResolvedValue(testFernDirectory);
        vi.mocked(loggingExeca).mockResolvedValue({ failed: false, stdout: "", stderr: "" });
        vi.mocked(writeFile).mockResolvedValue(undefined);
        vi.mocked(rerunFernCliAtVersion).mockResolvedValue(undefined);
    });

    describe("when global CLI is up-to-date but project pin is behind", () => {
        it("should upgrade the project's pinned version", async () => {
            cliContext.environment.packageVersion = "0.107.3";

            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "0.104.0",
                rawConfig: { version: "0.104.0", organization: "test-org" },
                _absolutePath: testConfigPath
            } as unknown as { version: string; rawConfig: Record<string, unknown>; _absolutePath: string });

            cliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "0.107.3",
                    isUpgradeAvailable: false
                },
                generatorUpgradeInfo: []
            });

            await upgrade({
                cliContext,
                includePreReleases: false,
                targetVersion: undefined
            });

            expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
                testConfigPath,
                expect.stringContaining('"version": "0.107.3"')
            );

            expect(vi.mocked(loggingExeca)).toHaveBeenCalledWith(expect.anything(), "npm", [
                "install",
                "-g",
                "test-package@0.107.3"
            ]);

            expect(vi.mocked(rerunFernCliAtVersion)).toHaveBeenCalledWith({
                version: "0.107.3",
                cliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "0.107.3"
                }
            });
        });
    });

    describe("when both global CLI and project pin are behind", () => {
        it("should upgrade both", async () => {
            cliContext.environment.packageVersion = "0.104.0";

            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "0.104.0",
                rawConfig: { version: "0.104.0", organization: "test-org" },
                _absolutePath: testConfigPath
            } as unknown as { version: string; rawConfig: Record<string, unknown>; _absolutePath: string });

            cliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "0.107.3",
                    isUpgradeAvailable: true
                },
                generatorUpgradeInfo: []
            });

            await upgrade({
                cliContext,
                includePreReleases: false,
                targetVersion: undefined
            });

            expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
                testConfigPath,
                expect.stringContaining('"version": "0.107.3"')
            );

            expect(vi.mocked(loggingExeca)).toHaveBeenCalledWith(expect.anything(), "npm", [
                "install",
                "-g",
                "test-package@0.107.3"
            ]);

            expect(vi.mocked(rerunFernCliAtVersion)).toHaveBeenCalledWith({
                version: "0.107.3",
                cliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: "0.104.0"
                }
            });
        });
    });

    describe("when both global CLI and project pin are up-to-date", () => {
        it("should report no upgrade available", async () => {
            cliContext.environment.packageVersion = "0.107.3";

            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "0.107.3",
                rawConfig: { version: "0.107.3", organization: "test-org" },
                _absolutePath: testConfigPath
            } as unknown as { version: string; rawConfig: Record<string, unknown>; _absolutePath: string });

            cliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "0.107.3",
                    isUpgradeAvailable: false
                },
                generatorUpgradeInfo: []
            });

            const loggerInfoSpy = vi.spyOn(cliContext.logger, "info");

            await upgrade({
                cliContext,
                includePreReleases: false,
                targetVersion: undefined
            });

            expect(loggerInfoSpy).toHaveBeenCalledWith("No upgrade available.");
            expect(vi.mocked(writeFile)).not.toHaveBeenCalled();
            expect(vi.mocked(loggingExeca)).not.toHaveBeenCalled();
            expect(vi.mocked(rerunFernCliAtVersion)).not.toHaveBeenCalled();
        });
    });

    describe("PREVIOUS_VERSION_ENV_VAR handling", () => {
        it("should pass the original version before mutation", async () => {
            const originalVersion = "0.104.0";
            cliContext.environment.packageVersion = originalVersion;

            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "0.104.0",
                rawConfig: { version: "0.104.0", organization: "test-org" },
                _absolutePath: testConfigPath
            } as unknown as { version: string; rawConfig: Record<string, unknown>; _absolutePath: string });

            cliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "0.107.3",
                    isUpgradeAvailable: true
                },
                generatorUpgradeInfo: []
            });

            await upgrade({
                cliContext,
                includePreReleases: false,
                targetVersion: undefined
            });

            expect(vi.mocked(rerunFernCliAtVersion)).toHaveBeenCalledWith({
                version: "0.107.3",
                cliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: originalVersion
                }
            });

            expect(cliContext.environment.packageVersion).toBe("0.107.3");
        });
    });

    describe("when project pins with wildcard (*)", () => {
        it("should not treat wildcard as behind", async () => {
            cliContext.environment.packageVersion = "0.107.3";

            vi.mocked(loadProjectConfig).mockResolvedValue({
                version: "*",
                rawConfig: { version: "*", organization: "test-org" },
                _absolutePath: testConfigPath
            } as unknown as { version: string; rawConfig: Record<string, unknown>; _absolutePath: string });

            cliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "0.107.3",
                    isUpgradeAvailable: false
                },
                generatorUpgradeInfo: []
            });

            const loggerInfoSpy = vi.spyOn(cliContext.logger, "info");

            await upgrade({
                cliContext,
                includePreReleases: false,
                targetVersion: undefined
            });

            expect(loggerInfoSpy).toHaveBeenCalledWith("No upgrade available.");
            expect(vi.mocked(writeFile)).not.toHaveBeenCalled();
            expect(vi.mocked(rerunFernCliAtVersion)).not.toHaveBeenCalled();
        });
    });

    describe("when no fern directory exists", () => {
        it("should fail with appropriate error", async () => {
            vi.mocked(getFernDirectory).mockResolvedValue(null);

            cliContext.isUpgradeAvailable = vi.fn().mockResolvedValue({
                cliUpgradeInfo: {
                    latestVersion: "0.107.3",
                    isUpgradeAvailable: true
                },
                generatorUpgradeInfo: []
            });

            await expect(
                upgrade({
                    cliContext,
                    includePreReleases: false,
                    targetVersion: undefined
                })
            ).rejects.toThrow();
        });
    });
});
