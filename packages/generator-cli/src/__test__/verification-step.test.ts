import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockStartContainer = vi.fn();
const mockStopContainer = vi.fn();
const mockCopyToContainer = vi.fn();
const mockExecInContainer = vi.fn();

vi.mock("@fern-api/docker-utils", () => ({
    startContainer: (...args: unknown[]) => mockStartContainer(...args),
    stopContainer: (...args: unknown[]) => mockStopContainer(...args),
    copyToContainer: (...args: unknown[]) => mockCopyToContainer(...args),
    execInContainer: (...args: unknown[]) => mockExecInContainer(...args)
}));

import type { PipelineLogger } from "../pipeline/PipelineLogger";
import { PostGenerationPipeline } from "../pipeline/PostGenerationPipeline";
import { GithubStep } from "../pipeline/steps/GithubStep";
import { VerificationStep } from "../pipeline/steps/VerificationStep";
import type { PipelineContext, VerifyStepConfig } from "../pipeline/types";

interface CapturingLogger extends PipelineLogger {
    debugs: string[];
    infos: string[];
    warns: string[];
    errors: string[];
}

function makeLogger(): CapturingLogger {
    const debugs: string[] = [];
    const infos: string[] = [];
    const warns: string[] = [];
    const errors: string[] = [];
    return {
        debug: (msg: string) => {
            debugs.push(msg);
        },
        info: (msg: string) => {
            infos.push(msg);
        },
        warn: (msg: string) => {
            warns.push(msg);
        },
        error: (msg: string) => {
            errors.push(msg);
        },
        debugs,
        infos,
        warns,
        errors
    };
}

function emptyContext(): PipelineContext {
    return { previousStepResults: {} };
}

const baseConfig: VerifyStepConfig = { enabled: true };
const generatorName = "fernapi/fern-typescript-sdk";
const generatorVersions = { [generatorName]: "0.42.1" };
const expectedValidatorImage = `${generatorName}-validator:0.42.1`;

describe("VerificationStep.execute()", () => {
    let workspace: tmp.DirectoryResult;
    let workspacePath: string;

    beforeEach(async () => {
        workspace = await tmp.dir({ unsafeCleanup: true });
        workspacePath = workspace.path;
        mockStartContainer.mockReset();
        mockStopContainer.mockReset();
        mockCopyToContainer.mockReset();
        mockExecInContainer.mockReset();
    });

    afterEach(async () => {
        await workspace.cleanup();
    });

    function writeVerifyScript(): void {
        mkdirSync(join(workspacePath, ".fern"), { recursive: true });
        writeFileSync(join(workspacePath, ".fern", "verify.sh"), "#!/usr/bin/env bash\necho ok\n");
    }

    it("no-ops with skipped=true when .fern/verify.sh is absent", async () => {
        const logger = makeLogger();
        const step = new VerificationStep(workspacePath, logger, baseConfig, generatorName, generatorVersions);

        const result = await step.execute(emptyContext());

        expect(result).toEqual({ executed: true, success: true, skipped: true });
        expect(mockStartContainer).not.toHaveBeenCalled();
        expect(mockCopyToContainer).not.toHaveBeenCalled();
        expect(mockExecInContainer).not.toHaveBeenCalled();
        expect(mockStopContainer).not.toHaveBeenCalled();
        expect(logger.errors).toEqual([]);
    });

    it("returns success when .fern/verify.sh exits zero", async () => {
        writeVerifyScript();
        mockStartContainer.mockResolvedValue("container-abc");
        mockCopyToContainer.mockResolvedValue(undefined);
        mockExecInContainer.mockResolvedValue({ stdout: "everything ok", stderr: "", exitCode: 0 });
        mockStopContainer.mockResolvedValue(undefined);

        const logger = makeLogger();
        const step = new VerificationStep(workspacePath, logger, baseConfig, generatorName, generatorVersions);

        const result = await step.execute(emptyContext());

        expect(result).toEqual({ executed: true, success: true, skipped: false });
        expect(mockStartContainer).toHaveBeenCalledTimes(1);
        expect(mockStartContainer.mock.calls[0]?.[0]).toMatchObject({
            imageName: expectedValidatorImage,
            runner: "docker"
        });
        expect(mockCopyToContainer).toHaveBeenCalledWith(
            expect.objectContaining({
                containerId: "container-abc",
                // `docker cp` of `<dir>/.` copies the directory's contents
                // into `/workspace` rather than nesting it as a subdir.
                hostPath: `${workspacePath}/.`,
                containerPath: "/workspace",
                runner: "docker"
            })
        );
        expect(mockExecInContainer).toHaveBeenCalledWith(
            expect.objectContaining({
                containerId: "container-abc",
                command: ["bash", "/workspace/.fern/verify.sh"],
                runner: "docker",
                reject: false
            })
        );
        expect(mockStopContainer).toHaveBeenCalledWith(
            expect.objectContaining({ containerId: "container-abc", runner: "docker" })
        );
        expect(logger.errors).toEqual([]);
    });

    it("captures stderr and reports failure when the verify script exits non-zero", async () => {
        writeVerifyScript();
        mockStartContainer.mockResolvedValue("container-fail");
        mockCopyToContainer.mockResolvedValue(undefined);
        mockExecInContainer.mockResolvedValue({
            stdout: "compiling...\n",
            stderr: "src/index.ts(12,5): error TS2322: Type 'string' is not assignable to type 'number'.\n",
            exitCode: 2
        });
        mockStopContainer.mockResolvedValue(undefined);

        const logger = makeLogger();
        const step = new VerificationStep(workspacePath, logger, baseConfig, generatorName, generatorVersions);

        const result = await step.execute(emptyContext());

        expect(result.executed).toBe(true);
        expect(result.success).toBe(false);
        expect(result.skipped).toBe(false);
        expect(result.stderr).toContain("error TS2322");
        expect(result.errorMessage).toContain("exited with code 2");
        // stderr is surfaced to the pipeline logger.
        expect(logger.errors.some((line) => line.includes("error TS2322"))).toBe(true);
        // Cleanup always runs.
        expect(mockStopContainer).toHaveBeenCalledWith(expect.objectContaining({ containerId: "container-fail" }));
    });

    it("falls back to stdout when stderr is empty on failure", async () => {
        writeVerifyScript();
        mockStartContainer.mockResolvedValue("container-stdout");
        mockCopyToContainer.mockResolvedValue(undefined);
        mockExecInContainer.mockResolvedValue({
            stdout: "boom: assertion failed",
            stderr: "",
            exitCode: 1
        });
        mockStopContainer.mockResolvedValue(undefined);

        const logger = makeLogger();
        const step = new VerificationStep(workspacePath, logger, baseConfig, generatorName, generatorVersions);

        const result = await step.execute(emptyContext());

        expect(result.success).toBe(false);
        expect(result.stderr).toBe("boom: assertion failed");
    });

    it("reports failure and still cleans up when startContainer throws (image pull/runtime missing)", async () => {
        writeVerifyScript();
        mockStartContainer.mockRejectedValue(
            new Error(`Failed to start container from image ${expectedValidatorImage}.\nError: pull access denied`)
        );

        const logger = makeLogger();
        const step = new VerificationStep(workspacePath, logger, baseConfig, generatorName, generatorVersions);

        const result = await step.execute(emptyContext());

        expect(result.executed).toBe(true);
        expect(result.success).toBe(false);
        expect(result.skipped).toBe(false);
        expect(result.errorMessage).toContain("Failed to start verification container");
        expect(result.errorMessage).toContain(expectedValidatorImage);
        expect(logger.errors.some((line) => line.includes("Failed to start verification container"))).toBe(true);
        expect(mockCopyToContainer).not.toHaveBeenCalled();
        expect(mockExecInContainer).not.toHaveBeenCalled();
        // No container was started, so nothing to stop.
        expect(mockStopContainer).not.toHaveBeenCalled();
    });

    it("reports failure and cleans up the container when copyToContainer throws", async () => {
        writeVerifyScript();
        mockStartContainer.mockResolvedValue("container-copy-fail");
        mockCopyToContainer.mockRejectedValue(new Error("disk full"));
        mockStopContainer.mockResolvedValue(undefined);

        const logger = makeLogger();
        const step = new VerificationStep(workspacePath, logger, baseConfig, generatorName, generatorVersions);

        const result = await step.execute(emptyContext());

        expect(result.success).toBe(false);
        expect(result.errorMessage).toContain("Failed to copy workspace into verification container");
        expect(mockExecInContainer).not.toHaveBeenCalled();
        expect(mockStopContainer).toHaveBeenCalledWith(expect.objectContaining({ containerId: "container-copy-fail" }));
    });

    it("forwards a non-default runner (podman) to all docker-utils calls", async () => {
        writeVerifyScript();
        mockStartContainer.mockResolvedValue("container-podman");
        mockCopyToContainer.mockResolvedValue(undefined);
        mockExecInContainer.mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 });
        mockStopContainer.mockResolvedValue(undefined);

        const logger = makeLogger();
        const step = new VerificationStep(
            workspacePath,
            logger,
            { enabled: true, runner: "podman" },
            generatorName,
            generatorVersions
        );

        const result = await step.execute(emptyContext());

        expect(result.success).toBe(true);
        for (const mock of [mockStartContainer, mockCopyToContainer, mockExecInContainer, mockStopContainer]) {
            expect(mock).toHaveBeenCalledWith(expect.objectContaining({ runner: "podman" }));
        }
    });

    it("returns failure without spinning up a container when the validator image cannot be derived", async () => {
        writeVerifyScript();
        const logger = makeLogger();

        const step = new VerificationStep(workspacePath, logger, baseConfig, undefined, undefined);
        const result = await step.execute(emptyContext());

        expect(result.success).toBe(false);
        expect(result.skipped).toBe(false);
        expect(result.errorMessage).toContain("Cannot derive validator image");
        expect(mockStartContainer).not.toHaveBeenCalled();
        expect(mockStopContainer).not.toHaveBeenCalled();
    });
});

describe("PostGenerationPipeline integration with VerificationStep", () => {
    let workspace: tmp.DirectoryResult;
    let workspacePath: string;

    beforeEach(async () => {
        workspace = await tmp.dir({ unsafeCleanup: true });
        workspacePath = workspace.path;
        mockStartContainer.mockReset();
        mockStopContainer.mockReset();
        mockCopyToContainer.mockReset();
        mockExecInContainer.mockReset();
    });

    afterEach(async () => {
        await workspace.cleanup();
    });

    function writeVerifyScript(): void {
        mkdirSync(join(workspacePath, ".fern"), { recursive: true });
        writeFileSync(join(workspacePath, ".fern", "verify.sh"), "#!/usr/bin/env bash\necho ok\n");
    }

    const silentLogger: PipelineLogger = {
        debug: () => undefined,
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined
    };

    it("does not register VerificationStep when config.verify is undefined", async () => {
        const pipeline = new PostGenerationPipeline(
            {
                outputDir: workspacePath,
                generatorName,
                generatorVersions
            },
            silentLogger
        );

        const result = await pipeline.run();

        expect(result.success).toBe(true);
        expect(result.steps.verify).toBeUndefined();
        expect(mockStartContainer).not.toHaveBeenCalled();
    });

    it("does not register VerificationStep when config.verify.enabled is false", async () => {
        writeVerifyScript();
        const pipeline = new PostGenerationPipeline(
            {
                outputDir: workspacePath,
                generatorName,
                generatorVersions,
                verify: { enabled: false }
            },
            silentLogger
        );

        const result = await pipeline.run();

        expect(result.success).toBe(true);
        expect(result.steps.verify).toBeUndefined();
        expect(mockStartContainer).not.toHaveBeenCalled();
    });

    it("runs VerificationStep and continues to GithubStep on success", async () => {
        writeVerifyScript();
        mockStartContainer.mockResolvedValue("container-pass");
        mockCopyToContainer.mockResolvedValue(undefined);
        mockExecInContainer.mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 });
        mockStopContainer.mockResolvedValue(undefined);

        const githubExecute = vi
            .spyOn(GithubStep.prototype, "execute")
            .mockResolvedValue({ executed: true, success: true });

        try {
            const pipeline = new PostGenerationPipeline(
                {
                    outputDir: workspacePath,
                    generatorName,
                    generatorVersions,
                    verify: { enabled: true },
                    github: {
                        enabled: true,
                        uri: "owner/repo",
                        token: "ghp_xxx",
                        mode: "pull-request"
                    }
                },
                silentLogger
            );

            const result = await pipeline.run();

            expect(result.success).toBe(true);
            expect(result.steps.verify).toEqual({ executed: true, success: true, skipped: false });
            expect(githubExecute).toHaveBeenCalledTimes(1);
            expect(result.steps.github).toEqual({ executed: true, success: true });
        } finally {
            githubExecute.mockRestore();
        }
    });

    it("aborts the pipeline before GithubStep when verification fails and surfaces stderr in result.errors", async () => {
        writeVerifyScript();
        mockStartContainer.mockResolvedValue("container-abort");
        mockCopyToContainer.mockResolvedValue(undefined);
        mockExecInContainer.mockResolvedValue({
            stdout: "",
            stderr: "tsc: missing semicolon",
            exitCode: 1
        });
        mockStopContainer.mockResolvedValue(undefined);

        const githubExecute = vi
            .spyOn(GithubStep.prototype, "execute")
            .mockResolvedValue({ executed: true, success: true });

        try {
            const pipeline = new PostGenerationPipeline(
                {
                    outputDir: workspacePath,
                    generatorName,
                    generatorVersions,
                    verify: { enabled: true },
                    github: {
                        enabled: true,
                        uri: "owner/repo",
                        token: "ghp_xxx",
                        mode: "pull-request"
                    }
                },
                silentLogger
            );

            const result = await pipeline.run();

            expect(result.success).toBe(false);
            expect(result.steps.verify?.success).toBe(false);
            expect(result.steps.verify?.stderr).toContain("missing semicolon");
            expect(result.errors).toBeDefined();
            expect(result.errors?.some((err) => err.includes("missing semicolon"))).toBe(true);
            // GithubStep is skipped after a verify failure.
            expect(githubExecute).not.toHaveBeenCalled();
            expect(result.steps.github).toBeUndefined();
        } finally {
            githubExecute.mockRestore();
        }
    });

    it("aborts the pipeline before GithubStep when VerificationStep.execute() throws an unexpected error", async () => {
        // Defense-in-depth: even if VerificationStep's internal try/catch is bypassed and an
        // unhandled exception leaks out, the pipeline must not push a broken SDK to GithubStep.
        const verifyExecute = vi
            .spyOn(VerificationStep.prototype, "execute")
            .mockRejectedValue(new Error("docker daemon unreachable"));

        const githubExecute = vi
            .spyOn(GithubStep.prototype, "execute")
            .mockResolvedValue({ executed: true, success: true });

        try {
            const pipeline = new PostGenerationPipeline(
                {
                    outputDir: workspacePath,
                    generatorName,
                    generatorVersions,
                    verify: { enabled: true },
                    github: {
                        enabled: true,
                        uri: "owner/repo",
                        token: "ghp_xxx",
                        mode: "pull-request"
                    }
                },
                silentLogger
            );

            const result = await pipeline.run();

            expect(result.success).toBe(false);
            expect(result.errors?.some((err) => err.includes("docker daemon unreachable"))).toBe(true);
            expect(githubExecute).not.toHaveBeenCalled();
            expect(result.steps.github).toBeUndefined();
        } finally {
            verifyExecute.mockRestore();
            githubExecute.mockRestore();
        }
    });

    it("forwards config.verify.runner to docker-utils calls (CLI plumbing parity for --verify with --runner)", async () => {
        // Mirrors the shape `runLocalGenerationForWorkspace` produces when the user passes
        // `--verify` with a non-default `--runner`: `verify: { enabled: verify === true, runner }`.
        writeVerifyScript();
        mockStartContainer.mockResolvedValue("container-runner");
        mockCopyToContainer.mockResolvedValue(undefined);
        mockExecInContainer.mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 });
        mockStopContainer.mockResolvedValue(undefined);

        const githubExecute = vi
            .spyOn(GithubStep.prototype, "execute")
            .mockResolvedValue({ executed: true, success: true });

        try {
            const pipeline = new PostGenerationPipeline(
                {
                    outputDir: workspacePath,
                    generatorName,
                    generatorVersions,
                    verify: { enabled: true, runner: "podman" },
                    github: {
                        enabled: true,
                        uri: "owner/repo",
                        token: "ghp_xxx",
                        mode: "pull-request"
                    }
                },
                silentLogger
            );

            const result = await pipeline.run();

            expect(result.success).toBe(true);
            expect(result.steps.verify).toEqual({ executed: true, success: true, skipped: false });
            for (const mock of [mockStartContainer, mockCopyToContainer, mockExecInContainer, mockStopContainer]) {
                expect(mock).toHaveBeenCalledWith(expect.objectContaining({ runner: "podman" }));
            }
        } finally {
            githubExecute.mockRestore();
        }
    });

    it("no-ops when .fern/verify.sh is missing and lets GithubStep run", async () => {
        // Intentionally do NOT write .fern/verify.sh — simulates a generator that
        // hasn't adopted verify yet.
        const githubExecute = vi
            .spyOn(GithubStep.prototype, "execute")
            .mockResolvedValue({ executed: true, success: true });

        try {
            const pipeline = new PostGenerationPipeline(
                {
                    outputDir: workspacePath,
                    generatorName,
                    generatorVersions,
                    verify: { enabled: true },
                    github: {
                        enabled: true,
                        uri: "owner/repo",
                        token: "ghp_xxx",
                        mode: "pull-request"
                    }
                },
                silentLogger
            );

            const result = await pipeline.run();

            expect(result.success).toBe(true);
            expect(result.steps.verify).toEqual({ executed: true, success: true, skipped: true });
            expect(mockStartContainer).not.toHaveBeenCalled();
            expect(githubExecute).toHaveBeenCalledTimes(1);
        } finally {
            githubExecute.mockRestore();
        }
    });
});
