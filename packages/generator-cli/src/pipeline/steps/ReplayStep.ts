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
        private readonly generatorVersions?: Record<string, string>,
        private readonly generatorName?: string
    ) {
        super(outputDir, logger);
    }

    async execute(context: PipelineContext): Promise<ReplayStepResult> {
        const generationCommit = context.previousStepResults.generationCommit;
        const prepared = generationCommit?.preparedReplay;

        if (generationCommit != null && prepared == null) {
            // GenerationCommitStep ran but replay isn't initialized (no lockfile) or
            // prepare failed. Mirror what replayRun would have returned in that case.
            return {
                executed: true,
                success: true,
                flow: "first-generation",
                patchesDetected: 0,
                patchesApplied: 0,
                patchesWithConflicts: 0
            };
        }

        const result =
            prepared != null
                ? await replayApply(prepared, {
                      stageOnly: this.config.stageOnly ?? false,
                      logger: this.logger
                  })
                : await replayRun({
                      outputDir: this.outputDir,
                      cliVersion: this.cliVersion,
                      generatorVersions: this.generatorVersions,
                      stageOnly: this.config.stageOnly ?? false,
                      generatorName: this.generatorName,
                      skipApplication: this.config.skipApplication,
                      logger: this.logger
                  });

        if (result.report == null) {
            return {
                executed: true,
                success: true,
                previousGenerationSha: result.previousGenerationSha ?? undefined,
                currentGenerationSha: result.currentGenerationSha ?? undefined,
                baseBranchHead: result.baseBranchHead ?? undefined,
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
            baseBranchHead: result.baseBranchHead ?? undefined,
            flow: report.flow,
            patchesDetected: report.patchesDetected,
            patchesApplied: report.patchesApplied,
            patchesWithConflicts: report.patchesWithConflicts,
            patchesAbsorbed: report.patchesAbsorbed,
            patchesRepointed: report.patchesRepointed,
            patchesContentRebased: report.patchesContentRebased,
            patchesKeptAsUserOwned: report.patchesKeptAsUserOwned,
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
}
