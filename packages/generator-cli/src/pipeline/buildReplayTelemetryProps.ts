import { createHash } from "crypto";
import type { PipelineResult, ReplayStepResult } from "./types.js";

/**
 * Tags type matches @fern-api/cli-v2's Tags shape: PostHog rejects nested
 * values, so all properties must be primitives.
 */
type TelemetryProps = Record<string, string | number | boolean | null>;

const KNOWN_CONFLICT_REASONS = [
    "same-line-edit",
    "new-file-both",
    "base-generation-mismatch",
    "patch-apply-failed"
] as const;

type KnownConflictReason = (typeof KNOWN_CONFLICT_REASONS)[number];

function isKnownConflictReason(reason: string | undefined): reason is KnownConflictReason {
    return reason != null && (KNOWN_CONFLICT_REASONS as readonly string[]).includes(reason);
}

/**
 * Derives PostHog properties for the `replay` event (action: pipeline_run) from a
 * `PipelineResult` and surrounding generation context.
 *
 * Pure / synchronous — no I/O, no PostHog client, no logger. Called from
 * `runLocalGenerationForWorkspace` after `pipeline.run()` returns and from
 * `RemoteTaskHandler` when a cloud job finishes (using the replay result parsed
 * from Fiddle's debug log line).
 *
 * PII handling: file paths, patch IDs, commit messages, and SHAs are NEVER
 * emitted. Repo URI is hashed (sha256, 16-char prefix) so per-repo dashboards
 * work without storing the raw URI. Conflict file paths are aggregated into
 * categorical bucket counts only.
 */
export function buildReplayTelemetryProps(input: {
    pipelineResult: PipelineResult;
    generatorName: string;
    generatorVersion: string;
    cliVersion?: string;
    repoUri: string;
    automationMode: boolean;
    autoMerge: boolean;
    skipIfNoDiff: boolean;
    hasBreakingChanges: boolean;
    versionArg: "auto" | "explicit" | "none";
    versionBump: string | undefined;
    replayConfigEnabled: boolean;
    noReplayFlag: boolean;
    githubMode: "pull-request" | "push";
    previewMode: boolean;
    durationMs: number;
}): TelemetryProps {
    const {
        pipelineResult,
        generatorName,
        generatorVersion,
        cliVersion,
        repoUri,
        automationMode,
        autoMerge,
        skipIfNoDiff,
        hasBreakingChanges,
        versionArg,
        versionBump,
        replayConfigEnabled,
        noReplayFlag,
        githubMode,
        previewMode,
        durationMs
    } = input;

    const replay: ReplayStepResult | undefined = pipelineResult.steps.replay;
    const github = pipelineResult.steps.github;

    const unresolvedPatches = replay?.unresolvedPatches ?? [];
    const unresolvedConflictFilesCount = unresolvedPatches.reduce(
        (sum, patch) => sum + patch.conflictDetails.length,
        0
    );

    const conflictBuckets: Record<KnownConflictReason | "other", number> = {
        "same-line-edit": 0,
        "new-file-both": 0,
        "base-generation-mismatch": 0,
        "patch-apply-failed": 0,
        other: 0
    };
    for (const patch of unresolvedPatches) {
        for (const detail of patch.conflictDetails) {
            if (isKnownConflictReason(detail.conflictReason)) {
                conflictBuckets[detail.conflictReason] += 1;
            } else {
                conflictBuckets.other += 1;
            }
        }
    }

    // For telemetry, "success" means the replay logic itself succeeded — NOT the
    // step.success field (which is true even on replay crashes, by design, so the
    // pipeline doesn't abort generation). Replay crashes are surfaced via
    // `replayCrashed` on the step result; map that to a falsy `success` here.
    const replayLogicSucceeded = replay != null && replay.executed && replay.replayCrashed !== true;

    return {
        action: "pipeline_run",
        success: replayLogicSucceeded,
        executed: replay?.executed ?? false,
        flow: replay?.flow ?? null,
        replay_crashed: replay?.replayCrashed === true,
        auto_bootstrapped: replay?.autoBootstrapped === true,
        bootstrap_attempted: replay?.bootstrapAttempted === true,
        pipeline_success: pipelineResult.success,
        pipeline_warnings_count: pipelineResult.warnings?.length ?? 0,
        replay_warnings_count: replay?.warnings?.length ?? 0,
        generator_name: generatorName,
        generator_version: generatorVersion,
        cli_version: cliVersion ?? null,
        repo_uri_hash: hashRepoUri(repoUri),
        automation_mode: automationMode,
        auto_merge_requested: autoMerge,
        auto_merge_enabled: github?.autoMergeEnabled === true,
        skip_if_no_diff: skipIfNoDiff,
        no_diff_skipped: github?.skippedNoDiff === true,
        version_arg: versionArg,
        version_bump: versionBump ?? null,
        has_breaking_changes: hasBreakingChanges,
        replay_config_enabled: replayConfigEnabled,
        no_replay_flag: noReplayFlag,
        github_mode: githubMode,
        preview_mode: previewMode,
        pr_created: github?.prNumber != null,
        pr_updated_existing: github?.updatedExistingPr === true,
        duration_ms: durationMs,
        patches_detected: replay?.patchesDetected ?? 0,
        patches_applied: replay?.patchesApplied ?? 0,
        patches_with_conflicts: replay?.patchesWithConflicts ?? 0,
        patches_absorbed: replay?.patchesAbsorbed ?? 0,
        patches_repointed: replay?.patchesRepointed ?? 0,
        patches_content_rebased: replay?.patchesContentRebased ?? 0,
        patches_kept_as_user_owned: replay?.patchesKeptAsUserOwned ?? 0,
        patches_skipped: replay?.patchesSkipped ?? 0,
        patches_partially_applied: replay?.patchesPartiallyApplied ?? 0,
        patches_conflict_resolved: replay?.patchesConflictResolved ?? 0,
        patches_reverted: replay?.patchesReverted ?? 0,
        patches_refreshed: replay?.patchesRefreshed ?? 0,
        unresolved_patches_count: unresolvedPatches.length,
        unresolved_conflict_files_count: unresolvedConflictFilesCount,
        conflicts_same_line_edit: conflictBuckets["same-line-edit"],
        conflicts_new_file_both: conflictBuckets["new-file-both"],
        conflicts_base_generation_mismatch: conflictBuckets["base-generation-mismatch"],
        conflicts_patch_apply_failed: conflictBuckets["patch-apply-failed"],
        conflicts_other: conflictBuckets.other
    };
}

function hashRepoUri(uri: string): string {
    return createHash("sha256").update(uri).digest("hex").slice(0, 16);
}
