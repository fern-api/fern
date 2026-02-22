import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { detectPackageManagerRunner, getAllRunners } from "../packageManagerRunner.js";

vi.mock("@fern-api/logging-execa");

describe("packageManagerRunner", () => {
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
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("detectPackageManagerRunner", () => {
        it("should detect npx when available", async () => {
            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "/usr/local/bin/npx",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            const runner = await detectPackageManagerRunner(mockLogger);

            expect(runner).toBeDefined();
            expect(runner?.type).toBe("npm");
            expect(runner?.command).toBe("npx");
            expect(runner?.label).toBe("npx (npm)");
        });

        it("should fall back to pnpm when npx is not available", async () => {
            vi.mocked(loggingExeca)
                // npx not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // pnpm found
                .mockResolvedValueOnce({
                    stdout: "/usr/local/bin/pnpm",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            const runner = await detectPackageManagerRunner(mockLogger);

            expect(runner).toBeDefined();
            expect(runner?.type).toBe("pnpm");
            expect(runner?.command).toBe("pnpm");
            expect(runner?.label).toBe("pnpm dlx");
        });

        it("should fall back to yarn when npx and pnpm are not available", async () => {
            vi.mocked(loggingExeca)
                // npx not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // pnpm not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // yarn found
                .mockResolvedValueOnce({
                    stdout: "/usr/local/bin/yarn",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            const runner = await detectPackageManagerRunner(mockLogger);

            expect(runner).toBeDefined();
            expect(runner?.type).toBe("yarn");
            expect(runner?.command).toBe("yarn");
            expect(runner?.label).toBe("yarn dlx");
        });

        it("should fall back to bunx when npx, pnpm, and yarn are not available", async () => {
            vi.mocked(loggingExeca)
                // npx not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // pnpm not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // yarn not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // bunx found
                .mockResolvedValueOnce({
                    stdout: "/usr/local/bin/bunx",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            const runner = await detectPackageManagerRunner(mockLogger);

            expect(runner).toBeDefined();
            expect(runner?.type).toBe("bun");
            expect(runner?.command).toBe("bunx");
            expect(runner?.label).toBe("bunx (bun)");
        });

        it("should fall back to deno when npx, pnpm, yarn, and bunx are not available", async () => {
            vi.mocked(loggingExeca)
                // npx not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // pnpm not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // yarn not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // bunx not found
                .mockResolvedValueOnce({
                    stdout: "",
                    stderr: "",
                    failed: true
                } as loggingExeca.ReturnValue)
                // deno found
                .mockResolvedValueOnce({
                    stdout: "/usr/local/bin/deno",
                    stderr: "",
                    failed: false
                } as loggingExeca.ReturnValue);

            const runner = await detectPackageManagerRunner(mockLogger);

            expect(runner).toBeDefined();
            expect(runner?.type).toBe("deno");
            expect(runner?.command).toBe("deno");
            expect(runner?.label).toBe("deno run");
        });

        it("should return undefined when no package manager is available", async () => {
            vi.mocked(loggingExeca).mockResolvedValue({
                stdout: "",
                stderr: "",
                failed: true
            } as loggingExeca.ReturnValue);

            const runner = await detectPackageManagerRunner(mockLogger);

            expect(runner).toBeUndefined();
        });

        it("should use 'which' command on Unix", async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, "platform", { value: "linux" });

            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "/usr/local/bin/npx",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await detectPackageManagerRunner(mockLogger);

            expect(vi.mocked(loggingExeca).mock.calls[0]?.[1]).toBe("which");

            Object.defineProperty(process, "platform", { value: originalPlatform });
        });

        it("should use 'where' command on Windows", async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, "platform", { value: "win32" });

            vi.mocked(loggingExeca).mockResolvedValueOnce({
                stdout: "C:\\Program Files\\nodejs\\npx.cmd",
                stderr: "",
                failed: false
            } as loggingExeca.ReturnValue);

            await detectPackageManagerRunner(mockLogger);

            expect(vi.mocked(loggingExeca).mock.calls[0]?.[1]).toBe("where");

            Object.defineProperty(process, "platform", { value: originalPlatform });
        });
    });

    describe("buildArgs", () => {
        it("should build correct args for npm/npx", () => {
            const runners = getAllRunners();
            const npmRunner = runners.find((r) => r.type === "npm");
            expect(npmRunner).toBeDefined();

            const args = npmRunner?.buildArgs("fern-api@1.2.3", ["upgrade", "--from", "1.0.0"]);
            expect(args).toEqual(["--quiet", "--yes", "fern-api@1.2.3", "upgrade", "--from", "1.0.0"]);
        });

        it("should build correct args for pnpm", () => {
            const runners = getAllRunners();
            const pnpmRunner = runners.find((r) => r.type === "pnpm");
            expect(pnpmRunner).toBeDefined();

            const args = pnpmRunner?.buildArgs("fern-api@1.2.3", ["upgrade", "--from", "1.0.0"]);
            expect(args).toEqual(["dlx", "fern-api@1.2.3", "upgrade", "--from", "1.0.0"]);
        });

        it("should build correct args for yarn", () => {
            const runners = getAllRunners();
            const yarnRunner = runners.find((r) => r.type === "yarn");
            expect(yarnRunner).toBeDefined();

            const args = yarnRunner?.buildArgs("fern-api@1.2.3", ["upgrade", "--from", "1.0.0"]);
            expect(args).toEqual(["dlx", "fern-api@1.2.3", "upgrade", "--from", "1.0.0"]);
        });

        it("should build correct args for bun/bunx", () => {
            const runners = getAllRunners();
            const bunRunner = runners.find((r) => r.type === "bun");
            expect(bunRunner).toBeDefined();

            const args = bunRunner?.buildArgs("fern-api@1.2.3", ["upgrade", "--from", "1.0.0"]);
            expect(args).toEqual(["fern-api@1.2.3", "upgrade", "--from", "1.0.0"]);
        });

        it("should build correct args for deno", () => {
            const runners = getAllRunners();
            const denoRunner = runners.find((r) => r.type === "deno");
            expect(denoRunner).toBeDefined();

            const args = denoRunner?.buildArgs("fern-api@1.2.3", ["upgrade", "--from", "1.0.0"]);
            expect(args).toEqual(["run", "-A", "npm:fern-api@1.2.3", "upgrade", "--from", "1.0.0"]);
        });

        it("should handle empty args array", () => {
            const runners = getAllRunners();
            for (const runner of runners) {
                const args = runner.buildArgs("fern-api@1.0.0", []);
                expect(args.length).toBeGreaterThan(0);
                // The package specifier should appear in at least one arg
                // (for deno it's prefixed with "npm:")
                expect(args.some((a) => a.includes("fern-api@1.0.0"))).toBe(true);
            }
        });
    });

    describe("getAllRunners", () => {
        it("should return all 5 runners", () => {
            const runners = getAllRunners();
            expect(runners).toHaveLength(5);
        });

        it("should include all expected package manager types", () => {
            const runners = getAllRunners();
            const types = runners.map((r) => r.type);
            expect(types).toContain("npm");
            expect(types).toContain("pnpm");
            expect(types).toContain("yarn");
            expect(types).toContain("bun");
            expect(types).toContain("deno");
        });

        it("should have npx as the first runner (highest priority)", () => {
            const runners = getAllRunners();
            expect(runners[0]?.type).toBe("npm");
            expect(runners[0]?.command).toBe("npx");
        });
    });
});
