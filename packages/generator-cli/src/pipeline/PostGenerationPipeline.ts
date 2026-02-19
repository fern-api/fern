import { consolePipelineLogger, type PipelineLogger } from "./PipelineLogger";
import { BaseStep } from "./steps/BaseStep";
import { GithubStep } from "./steps/GithubStep";
import { ReplayStep } from "./steps/ReplayStep";
import type { PipelineConfig, PipelineContext, PipelineResult, ReplayStepResult } from "./types";

/**
 * Orchestrates post-generation pipeline steps.
 * Steps run sequentially; upstream results flow to downstream steps via PipelineContext.
 */
export class PostGenerationPipeline {
    private steps: BaseStep[] = [];

    constructor(
        private readonly config: PipelineConfig,
        private readonly logger: PipelineLogger = consolePipelineLogger
    ) {
        if (config.replay?.enabled) {
            this.steps.push(
                new ReplayStep(
                    config.outputDir,
                    this.logger,
                    config.replay,
                    config.cliVersion,
                    config.generatorVersions,
                    config.generatorName
                )
            );
        }

        // Phase 2: FernignoreStep (not implemented yet)
        // if (config.fernignore?.enabled) {
        //   this.steps.push(new FernignoreStep(config.outputDir, this.logger));
        // }

        if (config.github?.enabled) {
            this.steps.push(new GithubStep(config.outputDir, this.logger, config.github));
        }
    }

    /**
     * Run all enabled pipeline steps in sequence.
     * Results accumulate in PipelineContext so downstream steps can read upstream results.
     */
    async run(): Promise<PipelineResult> {
        const result: PipelineResult = {
            success: true,
            steps: {}
        };

        const pipelineContext: PipelineContext = {
            previousStepResults: {}
        };

        for (const step of this.steps) {
            try {
                const stepResult = await step.execute(pipelineContext);
                (result.steps as Record<string, unknown>)[step.name] = stepResult;

                // Accumulate results for downstream steps
                if (step.name === "replay") {
                    pipelineContext.previousStepResults.replay = stepResult as ReplayStepResult;
                }

                if (!stepResult.success) {
                    result.success = false;
                    result.errors = result.errors ?? [];
                    result.errors.push(`${step.name} step failed`);
                }
            } catch (error) {
                result.success = false;
                result.errors = result.errors ?? [];
                const errorMessage = error instanceof Error ? error.message : String(error);
                result.errors.push(`${step.name} step error: ${errorMessage}`);
            }
        }

        return result;
    }
}
