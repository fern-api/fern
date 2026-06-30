import { describe, expect, it } from "vitest";
import { buildReplayTelemetryProps } from "../pipeline/buildReplayTelemetryProps.js";
import type { PipelineResult, ReplayStepResult } from "../pipeline/index.js";

const PII_FORBIDDEN_KEYS = [
    "patch_id",
    "patchId",
    "patch_message",
    "patchMessage",
    "files",
    "previous_generation_sha",
    "previousGenerationSha",
    "current_generation_sha",
    "currentGenerationSha",
    "base_branch_head",
    "baseBranchHead",
    "error_message",
    "errorMessage",
    "repo_uri",
    "repoUri",
    "commit_message"
];

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
    durationMs: 842
};

function makeReplayResult(overrides: Partial<ReplayStepResult> = {}): ReplayStepResult {
    return {
        executed: true,
        success: true,
        flow: "normal-regeneration",
        patchesDetected: 4,
        patchesApplied: 4,
        patchesWithConflicts: 0,
        patchesAbsorbed: 1,
        patchesRepointed: 0,
        patchesContentRebased: 0,
        patchesKeptAsUserOwned: 3,
        ...overrides
    };
}

function makePipelineResult(
    replay: ReplayStepResult | undefined,
    overrides: Partial<PipelineResult> = {}
): PipelineResult {
    return {
        success: true,
        steps: { replay, ...(overrides.steps ?? {}) },
        ...overrides
    };
}

describe("buildReplayTelemetryProps", () => {
    it("maps a clean replay-applied run end-to-end", () => {
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(makeReplayResult())
        });

        expect(props.action).toBe("pipeline_run");
        expect(props.success).toBe(true);
        expect(props.executed).toBe(true);
        expect(props.flow).toBe("normal-regeneration");
        expect(props.patches_detected).toBe(4);
        expect(props.patches_applied).toBe(4);
        expect(props.patches_with_conflicts).toBe(0);
        expect(props.patches_absorbed).toBe(1);
        expect(props.patches_kept_as_user_owned).toBe(3);
        expect(props.unresolved_patches_count).toBe(0);
        expect(props.unresolved_conflict_files_count).toBe(0);
        expect(props.duration_ms).toBe(842);
        expect(props.generator_name).toBe("fernapi/fern-typescript-node-sdk");
        expect(props.cli_version).toBe("0.30.0");
        expect(props.replay_config_enabled).toBe(true);
        expect(props.github_mode).toBe("pull-request");
    });

    it("returns hashed repo URI (16-char hex), never the raw URI", () => {
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(makeReplayResult())
        });

        expect(props.repo_uri_hash).toMatch(/^[0-9a-f]{16}$/);
        expect(JSON.stringify(props)).not.toContain("acme/sdk-typescript");

        // Determinism — same URI always produces same hash
        const second = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(makeReplayResult())
        });
        expect(second.repo_uri_hash).toBe(props.repo_uri_hash);
    });

    it("counts unresolved-conflict files and bucketizes by reason without leaking file paths", () => {
        const replay = makeReplayResult({
            patchesWithConflicts: 2,
            unresolvedPatches: [
                {
                    patchId: "patch-abc12345",
                    patchMessage: "tweak retry policy",
                    files: ["src/core/retry.ts", "src/core/retry.test.ts"],
                    conflictDetails: [
                        { file: "src/core/retry.ts", conflictReason: "same-line-edit" },
                        { file: "src/core/retry.test.ts", conflictReason: "same-line-edit" }
                    ]
                },
                {
                    patchId: "patch-def67890",
                    patchMessage: "preserve custom logger",
                    files: ["src/logger.ts"],
                    conflictDetails: [{ file: "src/logger.ts", conflictReason: "base-generation-mismatch" }]
                }
            ]
        });
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(replay)
        });

        expect(props.unresolved_patches_count).toBe(2);
        expect(props.unresolved_conflict_files_count).toBe(3);
        expect(props.conflicts_same_line_edit).toBe(2);
        expect(props.conflicts_base_generation_mismatch).toBe(1);
        expect(props.conflicts_new_file_both).toBe(0);
        expect(props.conflicts_patch_apply_failed).toBe(0);
        expect(props.conflicts_other).toBe(0);

        // Critical: no file paths, patch IDs, or commit messages leak into properties
        const serialized = JSON.stringify(props);
        expect(serialized).not.toContain("src/core/retry.ts");
        expect(serialized).not.toContain("src/logger.ts");
        expect(serialized).not.toContain("patch-abc");
        expect(serialized).not.toContain("preserve custom logger");
    });

    it("buckets unknown conflict reasons under 'other'", () => {
        const replay = makeReplayResult({
            patchesWithConflicts: 1,
            unresolvedPatches: [
                {
                    patchId: "patch-x",
                    patchMessage: "x",
                    files: ["a.ts"],
                    conflictDetails: [
                        { file: "a.ts", conflictReason: "future-reason-not-yet-defined" },
                        { file: "b.ts" } // no reason at all
                    ]
                }
            ]
        });
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(replay)
        });
        expect(props.conflicts_other).toBe(2);
        expect(props.conflicts_same_line_edit).toBe(0);
    });

    it("reports a replay crash as success: false via replayCrashed (FER-9956 invariant)", () => {
        // step.success stays true so the orchestrator does NOT abort generation
        // on replay errors. The crash is signaled via the new replayCrashed field
        // on ReplayStepResult; the helper translates it to a falsy `success`.
        const replay = makeReplayResult({
            success: true,
            replayCrashed: true,
            errorMessage: "git command failed: HEAD detached",
            flow: "normal-regeneration",
            patchesDetected: 0,
            patchesApplied: 0
        });
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(replay, { success: true })
        });

        expect(props.success).toBe(false);
        expect(props.replay_crashed).toBe(true);
        expect(props.flow).toBe("normal-regeneration");

        // errorMessage MUST NOT propagate verbatim — may carry path / SHA fragments
        const serialized = JSON.stringify(props);
        expect(serialized).not.toContain("HEAD detached");
        expect(serialized).not.toContain("git command failed");
    });

    it("reports replay logic succeeded when step ran without crashing", () => {
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(makeReplayResult())
        });
        expect(props.success).toBe(true);
        expect(props.replay_crashed).toBe(false);
    });

    it("buckets empty-string and null conflict reasons under 'other'", () => {
        const replay = makeReplayResult({
            patchesWithConflicts: 1,
            unresolvedPatches: [
                {
                    patchId: "p",
                    patchMessage: "p",
                    files: ["a.ts", "b.ts"],
                    conflictDetails: [
                        { file: "a.ts", conflictReason: "" },
                        { file: "b.ts", conflictReason: undefined }
                    ]
                }
            ]
        });
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(replay)
        });
        expect(props.conflicts_other).toBe(2);
        expect(props.conflicts_same_line_edit).toBe(0);
    });

    it("treats first-generation as success without conflict noise", () => {
        const replay = makeReplayResult({
            flow: "first-generation",
            patchesDetected: 0,
            patchesApplied: 0,
            patchesAbsorbed: 0,
            patchesKeptAsUserOwned: 0
        });
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(replay)
        });
        expect(props.flow).toBe("first-generation");
        expect(props.success).toBe(true);
        expect(props.patches_detected).toBe(0);
        expect(props.unresolved_patches_count).toBe(0);
    });

    it("emits zero-valued properties when ReplayStepResult is missing", () => {
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(undefined)
        });
        expect(props.executed).toBe(false);
        expect(props.success).toBe(false);
        expect(props.patches_detected).toBe(0);
        expect(props.flow).toBe(null);
    });

    it("never includes any PII keys regardless of input", () => {
        const replay = makeReplayResult({
            patchesWithConflicts: 1,
            unresolvedPatches: [
                {
                    patchId: "patch-secretid",
                    patchMessage: "should-not-appear",
                    files: ["sensitive/path/file.ts"],
                    conflictDetails: [{ file: "sensitive/path/file.ts", conflictReason: "same-line-edit" }]
                }
            ]
        });
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(replay)
        });

        for (const forbidden of PII_FORBIDDEN_KEYS) {
            expect(props).not.toHaveProperty(forbidden);
        }
    });

    it("respects all properties as primitives (Tags-compatible)", () => {
        const props = buildReplayTelemetryProps({
            ...BASE_INPUT,
            pipelineResult: makePipelineResult(makeReplayResult())
        });
        for (const [key, value] of Object.entries(props)) {
            const ok =
                typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null;
            if (!ok) {
                throw new Error(`Property "${key}" is not a primitive: ${typeof value}`);
            }
        }
    });
});
