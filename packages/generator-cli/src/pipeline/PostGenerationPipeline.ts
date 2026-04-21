import { extractErrorMessage } from "@fern-api/core-utils";
import { execFileSync } from "child_process";
import { FERN_BOT_EMAIL, FERN_BOT_NAME } from "./github/constants";
import { consolePipelineLogger, type PipelineLogger } from "./PipelineLogger";
import { AutoVersionStep } from "./steps/AutoVersionStep";
import { BaseStep } from "./steps/BaseStep";
import { GenerationCommitStep } from "./steps/GenerationCommitStep";
import { GithubStep } from "./steps/GithubStep";
import { ReplayStep } from "./steps/ReplayStep";
import type {
    AutoVersionStepResult,
    FernignoreStepResult,
    GenerationCommitStepResult,
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
        let replayEnabled = config.replay?.enabled ?? false;
        let autoVersionEnabled = config.autoVersion?.enabled ?? false;

        // Disallow push mode + replay: push mode force-pushes to the base branch,
        // which is incompatible with replay's 3-way merge workflow.
        if (replayEnabled && config.github?.mode === "push") {
            this.logger.warn(
                "Replay is not supported with GitHub push mode. Disabling replay to prevent force push to base branch."
            );
            replayEnabled = false;
        }

        // Autoversion travels with replay — it needs the two [fern-generated] SHAs
        // that the replay prepare phase produces. Non-replay orgs keep fiddle-side
        // autoversioning per the epic's non-goals (FER-9978).
        if (autoVersionEnabled && !replayEnabled) {
            this.logger.warn("AutoVersion requires Replay to be enabled. Disabling AutoVersion for this run.");
            autoVersionEnabled = false;
        }

        // Split order:
        //   GenerationCommitStep — replay prepare phase: commits [fern-generated],
        //     produces the PreparedReplay handle + prev/current [fern-generated] SHAs.
        //   AutoVersionStep — diffs prev vs current (pure generator output on both
        //     sides), runs FAI, rewrites placeholder version, prepends changelog.md,
        //     commits [fern-autoversion] between [fern-generated] and [fern-replay].
        //   ReplayStep — replay apply phase: detect/apply patches using the handle.
        //   GithubStep — push / PR.
        //
        // See FER-9978 (epic), FER-9980 (AutoVersionStep), FER-10001 (replay split).
        if (replayEnabled && config.replay != null) {
            this.steps.push(
                new GenerationCommitStep(
                    config.outputDir,
                    this.logger,
                    { enabled: true, skipApplication: config.replay.skipApplication },
                    config.cliVersion,
                    config.generatorVersions,
                    config.generatorName
                )
            );
        }

        if (autoVersionEnabled && config.autoVersion != null) {
            this.steps.push(new AutoVersionStep(config.outputDir, this.logger, config.autoVersion));
        }

        if (replayEnabled && config.replay != null) {
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

                if (step.name === "generationCommit") {
                    result.steps.generationCommit = stepResult as GenerationCommitStepResult;
                    pipelineContext.previousStepResults.generationCommit = stepResult as GenerationCommitStepResult;
                } else if (step.name === "replay") {
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
