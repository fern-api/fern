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
    fernToken: "test-token"
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

    it("runs the no-op step and records its result when autoVersion.enabled is true", async () => {
        const pipeline = new PostGenerationPipeline(
            {
                outputDir: "/tmp/fake",
                autoVersion: baseConfig
            },
            silentLogger
        );
        const result = await pipeline.run();
        expect(result.steps.autoVersion).toEqual({ executed: true, success: true });
        expect(result.success).toBe(true);
    });
});
