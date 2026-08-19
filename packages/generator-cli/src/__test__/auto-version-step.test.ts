import { describe, expect, it } from "vitest";
import type { AutoVersionStepConfig, PipelineContext, PipelineLogger } from "../pipeline/index.js";
import { PostGenerationPipeline } from "../pipeline/index.js";
import { AutoVersionStep } from "../pipeline/steps/AutoVersionStep.js";

const silentLogger: PipelineLogger = {
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined
};

const emptyContext: PipelineContext = {
    previousStepResults: {}
};

const baseConfig: AutoVersionStepConfig = {
    enabled: true,
    language: "typescript",
    ai: { provider: "anthropic", model: "claude-sonnet-4-6" }
};

describe("AutoVersionStep", () => {
    it("has name 'autoVersion' matching the pipeline dispatch key", () => {
        const step = new AutoVersionStep("/tmp/fake", silentLogger, baseConfig);
        expect(step.name).toBe("autoVersion");
    });

    it("enters non-replay mode when no prepared replay is available", async () => {
        const step = new AutoVersionStep("/tmp/fake", silentLogger, baseConfig);
        // Without a real git repo at /tmp/fake, gitDiffHead() throws.
        // This verifies the step attempts non-replay mode rather than no-oping.
        await expect(step.execute(emptyContext)).rejects.toThrow();
    });
});

describe("PostGenerationPipeline autoVersion wiring", () => {
    it("short-circuits when autoVersion config is omitted", async () => {
        const pipeline = new PostGenerationPipeline({ outputDir: "/tmp/fake" }, silentLogger);
        const result = await pipeline.run();
        expect(result.steps.autoVersion).toBeUndefined();
        expect(result.success).toBe(true);
    });

    it("short-circuits when autoVersion.enabled is false", async () => {
        const pipeline = new PostGenerationPipeline(
            {
                outputDir: "/tmp/fake",
                autoVersion: { ...baseConfig, enabled: false }
            },
            silentLogger
        );
        const result = await pipeline.run();
        expect(result.steps.autoVersion).toBeUndefined();
        expect(result.success).toBe(true);
    });

    it("wires autoVersion even when replay is not enabled (non-replay mode)", async () => {
        const pipeline = new PostGenerationPipeline(
            {
                outputDir: "/tmp/fake",
                autoVersion: baseConfig
            },
            silentLogger
        );
        const result = await pipeline.run();
        // AutoVersionStep is wired and runs, but gitDiffHead() fails at /tmp/fake
        // (no git repo). The pipeline catches the error and marks it as failed.
        expect(result.steps.autoVersion).toBeUndefined();
        expect(result.errors).toBeDefined();
        expect(result.errors?.some((e) => e.includes("autoVersion step error"))).toBe(true);
    });

    it("runs autoVersion alongside replay when both are enabled", async () => {
        const pipeline = new PostGenerationPipeline(
            {
                outputDir: "/tmp/fake",
                autoVersion: baseConfig,
                replay: { enabled: true }
            },
            silentLogger
        );
        const result = await pipeline.run();
        // No lockfile at /tmp/fake, so GenerationCommitStep yields preparedReplay: null.
        // AutoVersionStep falls through to non-replay mode and fails (no git repo).
        // Pipeline catches the error but continues.
        expect(result.errors).toBeDefined();
        expect(result.errors?.some((e) => e.includes("autoVersion step error"))).toBe(true);
    });
});
