import { describe, expect, it, vi } from "vitest";
import type { PipelineLogger } from "../pipeline/index.js";
import { PostGenerationPipeline } from "../pipeline/index.js";
import { GenerationCommitStep } from "../pipeline/steps/GenerationCommitStep.js";
import type { GenerationCommitStepResult } from "../pipeline/types.js";

const silentLogger: PipelineLogger = {
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined
};

describe("PostGenerationPipeline serialization", () => {
    it("produces a JSON-serializable result when GenerationCommitStep returns a circular preparedReplay", async () => {
        // Simulate the real-world shape: `simple-git`'s internal `GitExecutor`/
        // `GitExecutorChain` form a cycle that poisons `JSON.stringify` if the
        // handle leaks onto `result.steps.generationCommit`.
        const circular: { self?: unknown } = {};
        circular.self = circular;

        const mockResult = {
            executed: true,
            success: true,
            preparedReplay: circular as never,
            previousGenerationSha: "prev-sha",
            currentGenerationSha: "curr-sha",
            baseBranchHead: "base-sha",
            flow: "normal-regeneration"
        } satisfies GenerationCommitStepResult;

        const executeSpy = vi.spyOn(GenerationCommitStep.prototype, "execute").mockResolvedValue(mockResult);

        try {
            const pipeline = new PostGenerationPipeline(
                {
                    outputDir: "/tmp/fake",
                    replay: { enabled: true }
                },
                silentLogger
            );
            const result = await pipeline.run();

            expect(() => JSON.stringify(result)).not.toThrow();

            expect(result.steps.generationCommit?.previousGenerationSha).toBe("prev-sha");
            expect(result.steps.generationCommit?.currentGenerationSha).toBe("curr-sha");
            expect(result.steps.generationCommit?.baseBranchHead).toBe("base-sha");
            expect(result.steps.generationCommit?.flow).toBe("normal-regeneration");
            expect(result.steps.generationCommit?.preparedReplay).toBeUndefined();
        } finally {
            executeSpy.mockRestore();
        }
    });
});
