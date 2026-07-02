import { execFileSync } from "child_process";
import { replayApply, replayRun } from "../../replay/replay-run";
import type { PipelineLogger } from "../PipelineLogger";
import type { PipelineContext, ReplayStepConfig, ReplayStepResult } from "../types";
import { BaseStep } from "./BaseStep";

/**
 * Phase 2 of the replay flow: detect and apply customer patches on top of the
 * `[fern-generated]` commit (possibly with `[fern-autoversion]` layered on).
 *
 * When `GenerationCommitStep` has already run, ReplayStep consumes the
 * `PreparedReplay` handle from the pipeline context and calls `replayApply`.
 * When GenerationCommitStep did not run (e.g., older configurations that only
 * set `replay.enabled = true` without wiring the new step), this step falls
 * back to the atomic `replayRun` which internally composes both phases.
 */
export class ReplayStep extends BaseStep {
    readonly name = "replay";

    constructor(
        outputDir: string,
        logger: PipelineLogger,
        private readonly config: ReplayStepConfig,
        private readonly cliVersion?: string,
        private readonly generatorVersions?: Record<string, string>
    ) {
        super(outputDir, logger);
    }

    async execute(context: PipelineContext): Promise<ReplayStepResult> {
        const generationCommit = context.previousStepResults.generationCommit;
        const prepared = generationCommit?.preparedReplay;

        if (generationCommit != null && generationCommit.errorMessage != null && prepared == null) {
            // Prepare crashed in the prior step (errorMessage is set; prepared is
            // null). Surface as a replay failure but keep step.success === true so
            // the orchestrator does NOT propagate to pipelineResult.success = false
            // (which would abort generation). Telemetry and logs read replayCrashed.
            return {
                executed: true,
                success: true,
                replayCrashed: true,
                errorMessage: generationCommit.errorMessage,
                autoBootstrapped: false,
                bootstrapAttempted: generationCommit.bootstrapAttempted === true,
                flow: "normal-regeneration",
                patchesDetected: 0,
                patchesApplied: 0,
                patchesWithConflicts: 0
            };
        }

        if (generationCommit != null && prepared == null) {
            // GenerationCommitStep ran successfully but replay isn't initialized
            // (no lockfile and bootstrap couldn't anchor on a prior generation).
            // Legitimate first-generation flow.
            return {
                executed: true,
                success: true,
                autoBootstrapped: false,
                bootstrapAttempted: generationCommit.bootstrapAttempted === true,
                flow: "first-generation",
                patchesDetected: 0,
                patchesApplied: 0,
                patchesWithConflicts: 0
            };
        }

        const stageOnly = this.config.stageOnly ?? false;
        const result =
            prepared != null
                ? await replayApply(prepared, {
                      stageOnly,
                      logger: this.logger
                  })
                : await replayRun({
                      outputDir: this.outputDir,
                      cliVersion: this.cliVersion,
                      generatorVersions: this.generatorVersions,
                      stageOnly,
                      skipApplication: this.config.skipApplication,
                      logger: this.logger
                  });

        // The replay service updates the lockfile's `current_generation` in
        // memory during prepare and writes it to disk via `lockManager.save()`
        // during apply. However, in the no-patches flow with zero new patches,
        // no `[fern-replay]` commit is created — the lockfile update is left as
        // an uncommitted change. Since `skipCommit = true` for non-first-
        // generation flows, GithubStep won't commit it either, so the advance
        // is silently lost. On the next run the stale `current_generation`
        // causes `previousGenerationSha` to point at an old commit, producing
        // cumulative diffs and duplicate changelog entries.
        //
        // Commit the lockfile here when it was modified but not committed by
        // the replay service. This is safe even after a crash (best-effort:
        // either the save happened and we commit, or it didn't and this is a
        // no-op).
        if (!stageOnly) {
            this.commitLockfileIfUncommitted();
        }

        if (result.failureReason != null) {
            // Prepare or apply crashed at runtime — surface via replayCrashed so
            // telemetry/logs reflect reality, but keep step.success === true so
            // the orchestrator does NOT abort generation on replay errors.
            return {
                executed: true,
                success: true,
                replayCrashed: true,
                errorMessage: result.failureReason,
                previousGenerationSha: result.previousGenerationSha ?? undefined,
                currentGenerationSha: result.currentGenerationSha ?? undefined,
                autoBootstrapped: result.autoBootstrapped,
                bootstrapAttempted: result.bootstrapAttempted,
                flow: "normal-regeneration",
                patchesDetected: 0,
                patchesApplied: 0,
                patchesWithConflicts: 0
            };
        }

        if (result.report == null) {
            return {
                executed: true,
                success: true,
                previousGenerationSha: result.previousGenerationSha ?? undefined,
                currentGenerationSha: result.currentGenerationSha ?? undefined,
                autoBootstrapped: result.autoBootstrapped,
                bootstrapAttempted: result.bootstrapAttempted,
                flow: "first-generation",
                patchesDetected: 0,
                patchesApplied: 0,
                patchesWithConflicts: 0
            };
        }

        const report = result.report;
        return {
            executed: true,
            success: true,
            previousGenerationSha: result.previousGenerationSha ?? undefined,
            currentGenerationSha: result.currentGenerationSha ?? undefined,
            autoBootstrapped: result.autoBootstrapped,
            bootstrapAttempted: result.bootstrapAttempted,
            flow: report.flow,
            patchesDetected: report.patchesDetected,
            patchesApplied: report.patchesApplied,
            patchesWithConflicts: report.patchesWithConflicts,
            patchesAbsorbed: report.patchesAbsorbed,
            patchesRepointed: report.patchesRepointed,
            patchesContentRebased: report.patchesContentRebased,
            patchesKeptAsUserOwned: report.patchesKeptAsUserOwned,
            patchesSkipped: report.patchesSkipped,
            patchesPartiallyApplied: report.patchesPartiallyApplied,
            patchesConflictResolved: report.patchesConflictResolved,
            patchesReverted: report.patchesReverted,
            patchesRefreshed: report.patchesRefreshed,
            unresolvedPatches: report.unresolvedPatches?.map((info) => ({
                patchId: info.patchId,
                patchMessage: info.patchMessage,
                files: info.files,
                conflictDetails: info.conflictDetails.map((f) => ({
                    file: f.file,
                    conflictReason: f.conflictReason
                }))
            })),
            warnings: report.warnings
        };
    }

    /**
     * Commits `.fern/replay.lock` when replay saved the lockfile to disk but
     * didn't create a `[fern-replay]` commit (e.g. no-patches flow with zero
     * new patches). Without this, `skipCommit = true` in GithubStep drops the
     * lockfile advance, freezing `previousGenerationSha` across runs.
     */
    private commitLockfileIfUncommitted(): void {
        try {
            const status = execFileSync(
                "git",
                ["status", "--porcelain", "--", ".fern/replay.lock"],
                { cwd: this.outputDir, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
            ).trim();
            if (status.length === 0) {
                return;
            }
            execFileSync("git", ["add", "--", ".fern/replay.lock"], {
                cwd: this.outputDir,
                stdio: "pipe"
            });
            execFileSync("git", ["commit", "-m", "[fern-replay] advance lockfile"], {
                cwd: this.outputDir,
                stdio: "pipe"
            });
            this.logger.debug("ReplayStep: committed uncommitted lockfile advance.");
        } catch {
            // Best-effort — don't fail the pipeline on lockfile commit issues.
        }
    }
}
