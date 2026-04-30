import { replayPrepare } from "../../replay/replay-run";
import type { PipelineLogger } from "../PipelineLogger";
import type { GenerationCommitStepConfig, GenerationCommitStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

/**
 * Phase 1 of the replay flow: commit the freshly-generated working tree as
 * `[fern-generated]`. Produces the `PreparedReplay` handle plus the previous /
 * current `[fern-generated]` SHAs needed by downstream steps (AutoVersionStep
 * diffs the two SHAs; ReplayStep feeds the handle back into `replayApply`).
 *
 * Runs before AutoVersionStep and ReplayStep so the autoversion diff sees pure
 * generator output on both sides and sits as a commit between `[fern-generated]`
 * and `[fern-replay]`.
 *
 * When replay isn't initialized (no `.fern/replay.lock`) or prepare fails, the
 * step returns `preparedReplay: null` and downstream steps short-circuit — the
 * pipeline proceeds as if replay were disabled for this run.
 */
export class GenerationCommitStep extends BaseStep {
    readonly name = "generationCommit";

    constructor(
        outputDir: string,
        logger: PipelineLogger,
        private readonly config: GenerationCommitStepConfig,
        private readonly cliVersion?: string,
        private readonly generatorVersions?: Record<string, string>,
        private readonly generatorName?: string
    ) {
        super(outputDir, logger);
    }

    async execute(_context: PipelineContext): Promise<GenerationCommitStepResult> {
        const prepared = await replayPrepare({
            outputDir: this.outputDir,
            cliVersion: this.cliVersion,
            generatorVersions: this.generatorVersions,
            generatorName: this.generatorName,
            skipApplication: this.config.skipApplication,
            logger: this.logger
        });

        if (prepared == null) {
            return {
                executed: true,
                success: true,
                preparedReplay: null
            };
        }

        return {
            executed: true,
            success: true,
            preparedReplay: prepared,
            previousGenerationSha: prepared.previousGenerationSha ?? undefined,
            currentGenerationSha: prepared.currentGenerationSha,
            baseBranchHead: prepared.baseBranchHead ?? undefined,
            flow: prepared.flow
        };
    }
}
