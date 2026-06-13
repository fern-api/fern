import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReplayRunResult } from "../replay/replay-run";
import { replayRun } from "../replay/replay-run";
import { ReplayStep } from "../pipeline/steps/ReplayStep";
import type { PipelineContext, ReplayStepConfig } from "../pipeline/types";
import type { PipelineLogger } from "../pipeline/PipelineLogger";

// Unit-level proof that ReplayStep threads `replayCommitted` from the replay
// run result onto ReplayStepResult, independent of which @fern-api/replay
// version is installed (the field is computed by replay-run, mocked here).
// Partial mock: only the run entry points are stubbed — ReplayStep also
// imports `readReplayDegraded` from this module, and the real (tolerant)
// reader must keep running against the mocked reports.
vi.mock("../replay/replay-run", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../replay/replay-run")>();
    return {
        ...actual,
        replayRun: vi.fn(),
        replayApply: vi.fn()
    };
});

const mockLogger: PipelineLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

const emptyContext: PipelineContext = {
    previousStepResults: {}
};

const config: ReplayStepConfig = { enabled: true };

function runResult(overrides: Partial<ReplayRunResult>): ReplayRunResult {
    return {
        report: {
            flow: "first-generation",
            patchesDetected: 0,
            patchesApplied: 0,
            patchesWithConflicts: 0,
            patchesSkipped: 0,
            conflicts: []
        },
        fernignoreUpdated: false,
        previousGenerationSha: null,
        currentGenerationSha: "abc123",
        autoBootstrapped: false,
        bootstrapAttempted: true,
        replayCommitted: false,
        ...overrides
    };
}

describe("ReplayStep replayCommitted threading", () => {
    beforeEach(() => {
        vi.mocked(replayRun).mockReset();
    });

    it("surfaces replayCommitted=true from a seeding engine run", async () => {
        vi.mocked(replayRun).mockResolvedValue(runResult({ replayCommitted: true }));
        const step = new ReplayStep("/tmp/unused", mockLogger, config);

        const result = await step.execute(emptyContext);

        expect(result.flow).toBe("first-generation");
        expect(result.replayCommitted).toBe(true);
    });

    it("surfaces replayCommitted=false from a pre-seeding engine run", async () => {
        vi.mocked(replayRun).mockResolvedValue(runResult({ replayCommitted: false }));
        const step = new ReplayStep("/tmp/unused", mockLogger, config);

        const result = await step.execute(emptyContext);

        expect(result.flow).toBe("first-generation");
        expect(result.replayCommitted).toBe(false);
    });

    it("reports replayCommitted on crash results too (lock state still truthful)", async () => {
        vi.mocked(replayRun).mockResolvedValue(
            runResult({ report: null, failureReason: "boom", replayCommitted: false })
        );
        const step = new ReplayStep("/tmp/unused", mockLogger, config);

        const result = await step.execute(emptyContext);

        expect(result.replayCrashed).toBe(true);
        expect(result.replayCommitted).toBe(false);
    });
});
