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

    it("execute() is a no-op that reports executed + success", async () => {
        const step = new AutoVersionStep("/tmp/fake", silentLogger, baseConfig);
        const result = await step.execute(emptyContext);
        expect(result).toEqual({ executed: true, success: true });
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

    it("auto-disables autoVersion with a warning when replay is not enabled", async () => {
        let warnings: string[] = [];
        const capturingLogger: PipelineLogger = {
            debug: () => undefined,
            info: () => undefined,
            warn: (msg: string) => {
                warnings.push(msg);
            },
            error: () => undefined
        };
        const pipeline = new PostGenerationPipeline(
            {
                outputDir: "/tmp/fake",
                autoVersion: baseConfig
            },
            capturingLogger
        );
        const result = await pipeline.run();
        expect(result.steps.autoVersion).toBeUndefined();
        expect(warnings.some((w) => w.includes("AutoVersion requires Replay"))).toBe(true);
        expect(result.success).toBe(true);
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
        // AutoVersionStep still runs; current scaffold returns {executed, success}.
        expect(result.steps.autoVersion?.executed).toBe(true);
        expect(result.steps.autoVersion?.success).toBe(true);
        expect(result.success).toBe(true);
    });
});
