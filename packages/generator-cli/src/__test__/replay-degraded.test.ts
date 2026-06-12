import { describe, expect, it, vi } from "vitest";
import type { ReplayReport } from "@fern-api/replay";
import { buildReplayTelemetryProps } from "../pipeline/buildReplayTelemetryProps.js";
import { composePrBody, formatReplayDegradedBlock, logReplaySummary } from "../pipeline/replay-summary";
import { ReplayStep } from "../pipeline/steps/ReplayStep";
import type { PipelineLogger } from "../pipeline/PipelineLogger";
import type { PipelineResult, ReplayStepConfig, ReplayStepResult } from "../pipeline/types";
import { readReplayDegraded, replayRun } from "../replay/replay-run";

vi.mock("../replay/replay-run", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../replay/replay-run")>();
    return {
        ...actual,
        replayRun: vi.fn(),
        replayApply: vi.fn()
    };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * The degraded fields ship in a future @fern-api/replay release; the pinned
 * 0.18.0 `ReplayReport` doesn't declare them. Tests intersect the published
 * type with this shape so fixtures stay cast-free both before and after the
 * engine version bump.
 */
type DegradedReplayFields = {
    degraded?: boolean;
    degradedReasons?: unknown;
};

function makeEngineReport(extra: DegradedReplayFields = {}): ReplayReport & DegradedReplayFields {
    return {
        flow: "normal-regeneration",
        patchesDetected: 1,
        patchesApplied: 1,
        patchesWithConflicts: 0,
        patchesSkipped: 0,
        conflicts: [],
        ...extra
    };
}

function makeLogger(): PipelineLogger & { info: ReturnType<typeof vi.fn>; warn: ReturnType<typeof vi.fn> } {
    return {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    };
}

const DEGRADED_REASONS = [
    {
        code: "generation-tree-unreachable",
        message: "The previous generation (abc1234) was not reachable during this run."
    },
    {
        code: "patch-base-unreachable",
        message: "2 customization file(s) could not be checked against the generation they were made on."
    }
];

// ---------------------------------------------------------------------------
// readReplayDegraded — tolerant reader over the published engine types
// ---------------------------------------------------------------------------

describe("readReplayDegraded", () => {
    it("returns [] for a 0.18.0-shaped report without degraded fields", () => {
        expect(readReplayDegraded(makeEngineReport())).toEqual([]);
    });

    it("returns [] when degradedReasons is not an array", () => {
        expect(readReplayDegraded(makeEngineReport({ degradedReasons: "not-an-array" }))).toEqual([]);
        expect(readReplayDegraded(makeEngineReport({ degradedReasons: { code: "x", message: "y" } }))).toEqual([]);
        expect(readReplayDegraded(makeEngineReport({ degradedReasons: null }))).toEqual([]);
    });

    it("skips malformed entries (missing or non-string code/message)", () => {
        const reasons = readReplayDegraded(
            makeEngineReport({
                degradedReasons: [
                    { code: "generation-anchor-unreachable", message: "valid entry" },
                    { code: 42, message: "bad code type" },
                    { message: "missing code" },
                    { code: "missing-message" },
                    null,
                    "not-an-object"
                ]
            })
        );
        expect(reasons).toEqual([{ code: "generation-anchor-unreachable", message: "valid entry" }]);
    });

    it("returns the typed array for well-formed degraded reasons", () => {
        const reasons = readReplayDegraded(makeEngineReport({ degraded: true, degradedReasons: DEGRADED_REASONS }));
        expect(reasons).toEqual(DEGRADED_REASONS);
    });
});

// ---------------------------------------------------------------------------
// formatReplayDegradedBlock
// ---------------------------------------------------------------------------

describe("formatReplayDegradedBlock", () => {
    it("returns undefined for undefined / non-executed / healthy results", () => {
        expect(formatReplayDegradedBlock(undefined)).toBeUndefined();
        expect(formatReplayDegradedBlock({ executed: false, success: true })).toBeUndefined();
        expect(
            formatReplayDegradedBlock({
                executed: true,
                success: true,
                flow: "normal-regeneration",
                patchesApplied: 3
            })
        ).toBeUndefined();
    });

    it("renders a GitHub warning alert with each reason message when degraded", () => {
        const block = formatReplayDegradedBlock({
            executed: true,
            success: true,
            flow: "normal-regeneration",
            degraded: true,
            degradedReasons: DEGRADED_REASONS
        });
        expect(block).toBeDefined();
        expect(block).toContain("[!WARNING]");
        expect(block?.toLowerCase()).toContain("may not have been preserved");
        expect(block?.toLowerCase()).toContain("review");
        for (const reason of DEGRADED_REASONS) {
            expect(block).toContain(reason.message);
        }
    });

    it("renders the warning block when replay crashed (no reasons list)", () => {
        const block = formatReplayDegradedBlock({
            executed: true,
            success: true,
            replayCrashed: true,
            errorMessage: "Error: lockfile corrupted",
            flow: "normal-regeneration"
        });
        expect(block).toBeDefined();
        expect(block).toContain("[!WARNING]");
        expect(block?.toLowerCase()).toContain("may not have been preserved");
        expect(block).toContain("Error: lockfile corrupted");
    });
});

// ---------------------------------------------------------------------------
// composePrBody — degraded block sits at the TOP of the PR body
// ---------------------------------------------------------------------------

describe("composePrBody", () => {
    it("returns the plain body when no replay section and no degraded block", () => {
        expect(composePrBody({ prBody: "SDK update" })).toBe("SDK update");
    });

    it("appends the replay section after the body", () => {
        const body = composePrBody({ prBody: "SDK update", replaySection: "replay stuff" });
        expect(body.indexOf("SDK update")).toBeLessThan(body.indexOf("replay stuff"));
        expect(body).toContain("---");
    });

    it("prepends the degraded block at index 0, above the body and the replay section", () => {
        const body = composePrBody({
            prBody: "## Version 1.2.3\nSDK update",
            replaySection: "replay conflict table",
            degradedBlock: "> [!WARNING]\n> degraded"
        });
        expect(body.indexOf("> [!WARNING]")).toBe(0);
        expect(body.indexOf("> [!WARNING]")).toBeLessThan(body.indexOf("## Version 1.2.3"));
        expect(body.indexOf("## Version 1.2.3")).toBeLessThan(body.indexOf("replay conflict table"));
    });

    it("omits the degraded block when absent", () => {
        const body = composePrBody({ prBody: "SDK update", replaySection: "replay stuff" });
        expect(body).not.toContain("[!WARNING]");
    });
});

// ---------------------------------------------------------------------------
// logReplaySummary — structured [replay] line gains a trailing degraded= key
// ---------------------------------------------------------------------------

describe("logReplaySummary degraded key", () => {
    it("appends degraded=true to the structured line on degraded runs", () => {
        const logger = makeLogger();
        logReplaySummary(
            {
                executed: true,
                success: true,
                flow: "normal-regeneration",
                degraded: true,
                degradedReasons: DEGRADED_REASONS
            },
            logger
        );
        const structured = logger.info.mock.calls[0]?.[0];
        expect(structured).toContain("[replay] flow=normal-regeneration");
        expect(structured).toContain("degraded=true");
    });

    it("appends degraded=false on healthy runs (append-only; existing keys unchanged)", () => {
        const logger = makeLogger();
        logReplaySummary(
            { executed: true, success: true, flow: "normal-regeneration", patchesDetected: 2, patchesApplied: 2 },
            logger
        );
        const structured = logger.info.mock.calls[0]?.[0];
        expect(structured).toContain("degraded=false");
        // Frozen grep keys stay present and in order.
        for (const key of ["flow=", "detected=", "applied=", "conflicts=", "absorbed=", "repointed=", "content_rebased=", "kept_as_user_owned=", "unresolved=", "unresolved_files=", "warnings=", "success="]) {
            expect(structured).toContain(key);
        }
    });
});

// ---------------------------------------------------------------------------
// ReplayStep — maps engine degraded fields into ReplayStepResult
// ---------------------------------------------------------------------------

describe("ReplayStep degraded mapping", () => {
    function makeRunResult(report: ReplayReport) {
        return {
            report,
            fernignoreUpdated: false,
            previousGenerationSha: "prev-sha",
            currentGenerationSha: "curr-sha",
            autoBootstrapped: false,
            bootstrapAttempted: false
        };
    }

    it("surfaces degraded reasons from the engine report", async () => {
        const report: ReplayReport = makeEngineReport({ degraded: true, degradedReasons: DEGRADED_REASONS });
        vi.mocked(replayRun).mockResolvedValue(makeRunResult(report));

        const config: ReplayStepConfig = { enabled: true, stageOnly: true };
        const step = new ReplayStep("/tmp/fake", makeLogger(), config);
        const result = await step.execute({ previousStepResults: {} });

        expect(result.degraded).toBe(true);
        expect(result.degradedReasons).toEqual(DEGRADED_REASONS);
    });

    it("leaves degraded fields undefined when the engine report has none (0.18.0)", async () => {
        vi.mocked(replayRun).mockResolvedValue(makeRunResult(makeEngineReport()));

        const config: ReplayStepConfig = { enabled: true, stageOnly: true };
        const step = new ReplayStep("/tmp/fake", makeLogger(), config);
        const result = await step.execute({ previousStepResults: {} });

        expect(result.degraded).toBeUndefined();
        expect(result.degradedReasons).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Pipeline JSON — degraded fields survive serialization (the structured
// degraded flag in the pipeline JSON is exactly JSON.stringify(PipelineResult))
// ---------------------------------------------------------------------------

describe("pipeline JSON serialization of degraded fields", () => {
    it("degraded fields round-trip through JSON.stringify(PipelineResult)", () => {
        const replay: ReplayStepResult = {
            executed: true,
            success: true,
            flow: "normal-regeneration",
            patchesDetected: 1,
            patchesApplied: 0,
            patchesWithConflicts: 0,
            degraded: true,
            degradedReasons: DEGRADED_REASONS
        };
        const pipelineResult: PipelineResult = { success: true, steps: { replay } };

        const roundTripped: unknown = JSON.parse(JSON.stringify(pipelineResult));
        expect(roundTripped).toMatchObject({
            steps: {
                replay: {
                    degraded: true,
                    degradedReasons: DEGRADED_REASONS
                }
            }
        });
    });
});

// ---------------------------------------------------------------------------
// Telemetry — replay_degraded + replay_degraded_reason_codes (append-only)
// ---------------------------------------------------------------------------

describe("buildReplayTelemetryProps degraded props", () => {
    const BASE_INPUT = {
        generatorName: "fernapi/fern-typescript-node-sdk",
        generatorVersion: "2.6.3",
        cliVersion: "0.30.0",
        repoUri: "acme/sdk-typescript",
        automationMode: false,
        autoMerge: false,
        skipIfNoDiff: false,
        hasBreakingChanges: false,
        versionArg: "auto" as const,
        versionBump: "MINOR",
        replayConfigEnabled: true,
        noReplayFlag: false,
        githubMode: "pull-request" as const,
        previewMode: false,
        durationMs: 100
    };

    function propsFor(replay: ReplayStepResult | undefined) {
        const pipelineResult: PipelineResult = { success: true, steps: { replay } };
        return buildReplayTelemetryProps({ ...BASE_INPUT, pipelineResult });
    }

    it("emits replay_degraded=true and joined reason codes on degraded runs", () => {
        const props = propsFor({
            executed: true,
            success: true,
            flow: "normal-regeneration",
            degraded: true,
            degradedReasons: DEGRADED_REASONS
        });
        expect(props.replay_degraded).toBe(true);
        expect(props.replay_degraded_reason_codes).toBe("generation-tree-unreachable,patch-base-unreachable");
    });

    it("emits replay_degraded=false and null codes on healthy runs", () => {
        const props = propsFor({ executed: true, success: true, flow: "normal-regeneration" });
        expect(props.replay_degraded).toBe(false);
        expect(props.replay_degraded_reason_codes).toBeNull();
    });
});
