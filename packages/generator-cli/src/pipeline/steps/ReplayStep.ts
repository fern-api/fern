import { replayRun } from "../../replay/replay-run";
import type { PipelineLogger } from "../PipelineLogger";
import type { PipelineContext, ReplayStepConfig, ReplayStepResult } from "../types";
import { BaseStep } from "./BaseStep";

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

    async execute(_context: PipelineContext): Promise<ReplayStepResult> {
        const result = await replayRun({
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
