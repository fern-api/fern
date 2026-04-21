import { extractErrorMessage } from "@fern-api/core-utils";
import { execFileSync } from "child_process";
import { FERN_BOT_EMAIL, FERN_BOT_NAME } from "./github/constants";
import { consolePipelineLogger, type PipelineLogger } from "./PipelineLogger";
import { AutoVersionStep } from "./steps/AutoVersionStep";
import { BaseStep } from "./steps/BaseStep";
import { GithubStep } from "./steps/GithubStep";
import { ReplayStep } from "./steps/ReplayStep";
import type {
    AutoVersionStepResult,
    FernignoreStepResult,
    GithubStepResult,
    PipelineConfig,
    PipelineContext,
    PipelineResult,
    ReplayStepResult
} from "./types";

export class PostGenerationPipeline {
    private steps: BaseStep[] = [];

    constructor(
        private readonly config: PipelineConfig,
        private readonly logger: PipelineLogger = consolePipelineLogger
    ) {
        // Disallow push mode + replay: push mode force-pushes to the base branch,
        // which is incompatible with replay's 3-way merge workflow.
        if (config.replay?.enabled && config.github?.mode === "push") {
            this.logger.warn(
                "Replay is not supported with GitHub push mode. Disabling replay to prevent force push to base branch."
            );
            config.replay.enabled = false;
        }

        // Runs between the generation commit and replay detect/apply so the autoversion diff
        // sees only pure generator output on both sides (see FER-9978). Today the generation
        // commit is made inside ReplayStep; FER-9980 extracts it so AutoVersionStep sits
        // cleanly between them.
        if (config.autoVersion?.enabled) {
            this.steps.push(new AutoVersionStep(config.outputDir, this.logger, config.autoVersion));
        }

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

    async run(): Promise<PipelineResult> {
        // Set git identity BEFORE any steps run, so all commits
        // (including replay commits) are attributed to fern-bot.
        if (this.config.github?.enabled) {
            try {
                execFileSync("git", ["config", "user.name", FERN_BOT_NAME], { cwd: this.config.outputDir });
                execFileSync("git", ["config", "user.email", FERN_BOT_EMAIL], { cwd: this.config.outputDir });
            } catch {
                // pass
            }
        }

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

                if (step.name === "replay") {
                    result.steps.replay = stepResult as ReplayStepResult;
                    pipelineContext.previousStepResults.replay = stepResult as ReplayStepResult;
                } else if (step.name === "autoVersion") {
                    result.steps.autoVersion = stepResult as AutoVersionStepResult;
                    pipelineContext.previousStepResults.autoVersion = stepResult as AutoVersionStepResult;
                } else if (step.name === "fernignore") {
                    result.steps.fernignore = stepResult as FernignoreStepResult;
                } else if (step.name === "github") {
                    result.steps.github = stepResult as GithubStepResult;
                }

                if (!stepResult.success) {
                    result.success = false;
                    result.errors = result.errors ?? [];
                    result.errors.push(stepResult.errorMessage ?? `${step.name} step failed`);
                }
            } catch (error) {
                result.success = false;
                result.errors = result.errors ?? [];
                const errorMessage = extractErrorMessage(error);
                result.errors.push(`${step.name} step error: ${errorMessage}`);
            }
        }

        return result;
    }
}
