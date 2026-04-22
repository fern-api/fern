import type { PipelineLogger } from "../PipelineLogger";
import type { AutoVersionStepConfig, AutoVersionStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

/**
 * Runs SDK autoversioning inside the replay pipeline, between the `[fern-generated]` commit
 * and replay detect/apply. Diffs prev vs new `[fern-generated]` sha (both pure generator output),
 * calls FAI to determine the bump and changelog, rewrites the placeholder version, appends
 * to changelog.md, and commits `[fern-autoversion]`.
 *
 * This scaffold is a no-op — `execute()` logic lands in FER-9980.
 */
export class AutoVersionStep extends BaseStep {
    readonly name = "autoVersion";

    constructor(
        outputDir: string,
        logger: PipelineLogger,
        private readonly config: AutoVersionStepConfig
    ) {
        super(outputDir, logger);
    }

    async execute(_context: PipelineContext): Promise<AutoVersionStepResult> {
        this.logger.info(
            `AutoVersionStep: no-op scaffold for language=${this.config.language} (logic lands in FER-9980)`
        );
        return {
            executed: true,
            success: true
        };
    }
}
