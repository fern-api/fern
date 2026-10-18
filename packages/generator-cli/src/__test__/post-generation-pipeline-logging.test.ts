import { describe, expect, it, vi } from "vitest";
import type { PipelineLogger } from "../pipeline/index.js";
import { PostGenerationPipeline } from "../pipeline/PostGenerationPipeline.js";
import { GenerationCommitStep } from "../pipeline/steps/GenerationCommitStep.js";
import type { GenerationCommitStepResult } from "../pipeline/types.js";

interface RecordingLogger extends PipelineLogger {
    infos: string[];
    errors: string[];
}

function createRecordingLogger(): RecordingLogger {
    const infos: string[] = [];
    const errors: string[] = [];
    return {
        debug: () => undefined,
        info: (message) => infos.push(message),
        warn: () => undefined,
        error: (message) => errors.push(message),
        infos,
        errors
    };
}

function createGenerationCommitResult(): GenerationCommitStepResult {
    return {
        executed: true,
        success: true,
        preparedReplay: undefined as never,
        previousGenerationSha: "p",
        currentGenerationSha: "c",
        flow: "normal-regeneration"
    };
}

function createPipeline(logger: PipelineLogger): PostGenerationPipeline {
    return new PostGenerationPipeline(
        {
            outputDir: "/tmp/fake",
            replay: { enabled: true }
        },
        logger
    );
}

describe("PostGenerationPipeline step logging", () => {
    it("logs when a step starts and finishes", async () => {
        const logger = createRecordingLogger();
        const executeSpy = vi
            .spyOn(GenerationCommitStep.prototype, "execute")
            .mockResolvedValue(createGenerationCommitResult());

        try {
            await createPipeline(logger).run();

            expect(logger.infos).toContainEqual(expect.stringMatching(/Pipeline step 'generationCommit' starting/));
            expect(logger.infos).toContainEqual(
                expect.stringMatching(/Pipeline step 'generationCommit' finished in \d+ms \(success=true\)/)
            );
        } finally {
            executeSpy.mockRestore();
        }
    });

    it("logs heartbeats while a step is running and stops after it finishes", async () => {
        vi.useFakeTimers();
        const logger = createRecordingLogger();
        const executeSpy = vi.spyOn(GenerationCommitStep.prototype, "execute").mockImplementation(
            async () =>
                await new Promise<GenerationCommitStepResult>((resolve) => {
                    setTimeout(() => resolve(createGenerationCommitResult()), 65_000);
                })
        );

        try {
            const runPromise = createPipeline(logger).run();
            await vi.advanceTimersByTimeAsync(65_000);

            const heartbeatMessages = () =>
                logger.infos.filter((message) => /still running \(\d+s elapsed\)/.test(message));
            expect(heartbeatMessages().length).toBeGreaterThanOrEqual(2);

            await runPromise;
            const heartbeatCountAfterCompletion = heartbeatMessages().length;
            await vi.advanceTimersByTimeAsync(65_000);
            expect(heartbeatMessages()).toHaveLength(heartbeatCountAfterCompletion);
        } finally {
            executeSpy.mockRestore();
            vi.useRealTimers();
        }
    });

    it("logs when a step throws and marks the pipeline as unsuccessful", async () => {
        const logger = createRecordingLogger();
        const executeSpy = vi.spyOn(GenerationCommitStep.prototype, "execute").mockRejectedValue(new Error("boom"));

        try {
            const result = await createPipeline(logger).run();

            expect(logger.errors).toContainEqual(
                expect.stringMatching(/Pipeline step 'generationCommit' threw after \d+ms: boom/)
            );
            expect(result.success).toBe(false);
        } finally {
            executeSpy.mockRestore();
        }
    });
});
