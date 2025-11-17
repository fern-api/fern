import { loggingExeca } from "@fern-api/logging-execa";
import { realpath } from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CliContext } from "../../../cli-context/CliContext";
import { selfUpdate } from "../selfUpdate";

vi.mock("@fern-api/logging-execa");
vi.mock("fs/promises", () => ({
    realpath: vi.fn()
}));

// Store original platform
const originalPlatform = process.platform;

describe("selfUpdate", () => {
    let mockCliContext: CliContext;
    let mockLogger: {
        info: ReturnType<typeof vi.fn>;
        error: ReturnType<typeof vi.fn>;
        warn: ReturnType<typeof vi.fn>;
        debug: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockLogger = {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn()
        };

        mockCliContext = {
            logger: mockLogger,
            failAndThrow: vi.fn((message: string) => {
                throw new Error(message);
            })
        } as unknown as CliContext;

        // Mock realpath to return the same path (no symlinks by default)
        vi.mocked(realpath).mockImplementation(async (path) => path as string);
    });

    afterEach(() => {
        vi.clearAllMocks();
        // Restore original platform
        Object.defineProperty(process, "platform", {
            value: originalPlatform
        });
    });

    describe("installation method detection", () => {
        describe("npm installation", () => {
            it("should detect npm installation via path pattern", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // All package manager bin checks to skip bin directory matching
                    .mockResolvedValue({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("npm"));
            });
        });

        describe("pnpm installation", () => {
            it("should detect pnpm installation via path pattern (.pnpm)", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/home/user/.pnpm-global/5/node_modules/fern-api/bin/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // All package manager bin checks fail, use path fallback
                    .mockResolvedValue({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("pnpm"));
            });

            it("should detect pnpm installation via path pattern (pnpm-global)", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/home/user/.local/share/pnpm-global/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // All package manager bin checks fail, use path fallback
                    .mockResolvedValue({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("pnpm"));
            });

            it("should detect pnpm installation via path pattern (/pnpm/)", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/opt/pnpm/global/node_modules/fern-api/bin/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // All package manager bin checks fail, use path fallback
                    .mockResolvedValue({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("pnpm"));
            });
        });

        describe("yarn installation", () => {
            it("should detect yarn installation via path pattern", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/home/user/.yarn/packages/fern-api/bin/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // All package manager bin checks fail, use path fallback
                    .mockResolvedValue({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("yarn"));
            });
        });

        describe("bun installation", () => {
            it("should detect bun installation via path pattern", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/home/user/.bun/install/global/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // All package manager bin checks fail, use path fallback
                    .mockResolvedValue({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("bun"));
            });
        });

        describe("brew installation", () => {
            it("should detect brew installation with fern-api package", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/opt/homebrew/bin/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // brew list --versions fern-api
                    .mockResolvedValueOnce({
                        stdout: "fern-api 1.0.0",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("brew"));
            });

            it("should detect brew installation with fern package", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/usr/local/Cellar/fern/1.0.0/bin/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // brew list --versions fern-api (fails)
                    .mockResolvedValueOnce({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue)
                    // brew list --versions fern (succeeds)
                    .mockResolvedValueOnce({
                        stdout: "fern 1.0.0",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("brew"));
            });

            it("should detect brew via Cellar path pattern", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/usr/local/Cellar/fern-api/1.0.0/bin/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // brew list --versions fern-api
                    .mockResolvedValueOnce({
                        stdout: "fern-api 1.0.0",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("brew"));
            });

            it("should detect brew via Homebrew path pattern", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/opt/Homebrew/bin/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // brew list --versions fern-api
                    .mockResolvedValueOnce({
                        stdout: "fern-api 1.0.0",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue);

                await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

                expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("brew"));
            });
        });

        describe("unknown installation", () => {
            it("should fail when installation method cannot be detected", async () => {
                vi.mocked(loggingExeca)
                    // which fern - returns unknown path
                    .mockResolvedValueOnce({
                        stdout: "/some/custom/path/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // All package manager bin checks fail
                    .mockResolvedValue({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue);

                await expect(
                    selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true })
                ).rejects.toThrow("Could not detect how Fern CLI was installed");
            });

            it("should fail when which command fails", async () => {
                vi.mocked(loggingExeca).mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

                await expect(
                    selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true })
                ).rejects.toThrow("Could not detect how Fern CLI was installed");
            });

            it("should include path information in error message", async () => {
                vi.mocked(loggingExeca)
                    // which fern
                    .mockResolvedValueOnce({
                        stdout: "/custom/location/fern",
                        stderr: "",
                        failed: false
                    } as loggingExeca.ReturnValue)
                    // All package manager bin checks fail
                    .mockResolvedValue({
                        stdout: "",
                        stderr: "",
                        failed: true
                    } as loggingExeca.ReturnValue);

                await expect(
                    selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true })
                ).rejects.toThrow(/Found fern at: \/custom\/location\/fern/);
            });
        });
    });

    describe("update command generation", () => {
        it("should generate npm update command with specific version", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("npm install -g fern-api@1.2.3"));
        });

        it("should generate pnpm update command with latest", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/home/user/.pnpm-global/5/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("pnpm add -g fern-api@latest"));
        });

        it("should generate yarn update command", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/home/user/.yarn/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "2.0.0", dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("yarn global add fern-api@2.0.0"));
        });

        it("should generate bun update command", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/home/user/.bun/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.5.0", dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("bun install -g fern-api@1.5.0"));
        });

        it("should generate brew upgrade command (ignores version parameter)", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/opt/homebrew/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "fern-api 1.0.0",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.5.0", dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("brew upgrade fern-api"));
        });
    });

    describe("dry run mode", () => {
        it("should not execute update command in dry run mode", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith("Dry run mode - no changes will be made");
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Would run:"));
        });
    });

    describe("actual update execution", () => {
        it("should execute update command successfully", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // Mock failed package manager bin checks
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // The actual update command
                .mockResolvedValueOnce({
                    stdout: "Successfully installed fern-api@1.2.3",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: false });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Running:"));
            expect(mockLogger.info).toHaveBeenCalledWith("✓ Fern CLI updated successfully!");
        });

        it("should execute update for npm without version", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // Mock failed package manager bin checks
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // The actual update command
                .mockResolvedValueOnce({
                    stdout: "Successfully installed fern-api@latest",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: false });

            const updateCall = vi.mocked(loggingExeca).mock.calls[5];
            expect(updateCall?.[1]).toBe("npm");
            expect(updateCall?.[2]).toEqual(["install", "-g", "fern-api@latest"]);
        });

        it("should execute update for pnpm", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/home/user/.pnpm-global/5/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // Mock failed package manager bin checks
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // The actual update command
                .mockResolvedValueOnce({
                    stdout: "Successfully installed",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: false });

            const updateCall = vi.mocked(loggingExeca).mock.calls[5];
            expect(updateCall?.[1]).toBe("pnpm");
            expect(updateCall?.[2]).toEqual(["add", "-g", "fern-api@1.2.3"]);
        });

        it("should execute update for yarn", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/home/user/.yarn/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // Mock failed package manager bin checks
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // The actual update command
                .mockResolvedValueOnce({
                    stdout: "success",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: false });

            const updateCall = vi.mocked(loggingExeca).mock.calls[5];
            expect(updateCall?.[1]).toBe("yarn");
            expect(updateCall?.[2]).toEqual(["global", "add", "fern-api@1.2.3"]);
        });

        it("should execute update for bun", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/home/user/.bun/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // Mock failed package manager bin checks
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // The actual update command
                .mockResolvedValueOnce({
                    stdout: "installed",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: false });

            const updateCall = vi.mocked(loggingExeca).mock.calls[5];
            expect(updateCall?.[1]).toBe("bun");
            expect(updateCall?.[2]).toEqual(["install", "-g", "fern-api@1.2.3"]);
        });

        it("should execute update for brew", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/opt/homebrew/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "fern-api 1.0.0",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "Updated fern-api",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: false });

            const updateCall = vi.mocked(loggingExeca).mock.calls[2];
            expect(updateCall?.[1]).toBe("brew");
            expect(updateCall?.[2]).toEqual(["upgrade", "fern-api"]);
        });
    });

    describe("error handling", () => {
        it("should handle update command failure", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // Mock failed package manager bin checks
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // The actual update command fails
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "npm ERR! network timeout",
                    failed: true
                } as loggingExeca.ReturnValue);

            await expect(selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: false })).rejects.toThrow(
                "Update failed. Please try updating manually."
            );

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to update Fern CLI: npm ERR! network timeout");
        });

        it("should handle permission errors", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // Mock failed package manager bin checks
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // The actual update command fails with EACCES
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "npm ERR! code EACCES",
                    failed: true
                } as loggingExeca.ReturnValue);

            await expect(selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: false })).rejects.toThrow(
                "Update failed. Please try updating manually."
            );

            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("EACCES"));
        });
    });

    describe("logging", () => {
        it("should log detection progress", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith("Detecting installation method...");
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Detected installation method:"));
        });

        it("should log the update command before execution", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "/usr/local/lib/node_modules/fern-api/bin/fern",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // Mock failed package manager bin checks
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // Actual update
                .mockResolvedValueOnce({
                    stdout: "Success",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: "1.2.3", dryRun: false });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Running:"));
        });
    });

    describe("Windows compatibility", () => {
        beforeEach(() => {
            // Mock Windows platform
            Object.defineProperty(process, "platform", {
                value: "win32"
            });
        });

        it("should use 'where' command instead of 'which' on Windows", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "C:\\Program Files\\nodejs\\node_modules\\fern-api\\bin\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            // First call should be 'where fern'
            expect(vi.mocked(loggingExeca).mock.calls[0]?.[1]).toBe("where");
            expect(vi.mocked(loggingExeca).mock.calls[0]?.[2]).toEqual(["fern"]);
        });

        it("should handle multiple paths returned by 'where' command on Windows", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "C:\\Program Files\\nodejs\\node_modules\\fern-api\\bin\\fern.exe\r\nC:\\Users\\user\\AppData\\Roaming\\npm\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            // Should use the first path found
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Found fern at: C:\\Program Files\\nodejs\\node_modules\\fern-api\\bin\\fern.exe"
            );
        });

        it("should detect npm installation with Windows paths", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "C:\\Program Files\\nodejs\\node_modules\\fern-api\\bin\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("npm"));
        });

        it("should detect pnpm installation with Windows paths", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "C:\\Users\\user\\AppData\\Local\\.pnpm\\fern-api\\bin\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("pnpm"));
        });

        it("should detect yarn installation with Windows paths", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "C:\\Users\\user\\AppData\\Local\\yarn\\bin\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("yarn"));
        });

        it("should detect bun installation with Windows paths", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "C:\\Users\\user\\.bun\\install\\global\\fern-api\\bin\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("bun"));
        });

        it("should skip Homebrew detection on Windows", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "C:\\opt\\homebrew\\bin\\node_modules\\fern-api\\bin\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            // Should not try to call 'brew' command on Windows
            const brewCalls = vi.mocked(loggingExeca).mock.calls.filter((call) => call[1] === "brew");
            expect(brewCalls).toHaveLength(0);
        });

        it("should not include Homebrew in error diagnostics on Windows", async () => {
            vi.mocked(loggingExeca)
                .mockResolvedValueOnce({
                    stdout: "C:\\some\\custom\\path\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                .mockResolvedValue({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue);

            await expect(
                selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true })
            ).rejects.toThrow();

            // Should not mention Homebrew in debug logs
            const homebrewMentions = mockLogger.debug.mock.calls.filter((call) =>
                call[0]?.toString().toLowerCase().includes("homebrew")
            );
            expect(homebrewMentions).toHaveLength(0);
        });

        it("should handle Windows path with drive letter in bin directory comparison", async () => {
            vi.mocked(loggingExeca)
                // where fern
                .mockResolvedValueOnce({
                    stdout: "C:\\Users\\user\\AppData\\Roaming\\pnpm-global\\fern.exe",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue)
                // npm bin -g
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // pnpm bin -g - returns matching directory
                .mockResolvedValueOnce({
                    stdout: "C:\\Users\\user\\AppData\\Roaming\\pnpm-global",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            await selfUpdate({ cliContext: mockCliContext, version: undefined, dryRun: true });

            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("pnpm"));
        });
    });
});
