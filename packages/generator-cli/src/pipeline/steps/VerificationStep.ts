import { ContainerRunner, extractErrorMessage } from "@fern-api/core-utils";
import { copyToContainer, execInContainer, startContainer, stopContainer } from "@fern-api/docker-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { existsSync } from "fs";
import { join } from "path";
import type { PipelineLogger } from "../PipelineLogger";
import type { PipelineContext, VerificationStepResult, VerifyStepConfig } from "../types";
import { BaseStep } from "./BaseStep";

const CONTAINER_WORKSPACE_PATH = "/workspace";
const VERIFY_SCRIPT_RELATIVE_PATH = ".fern/verify.sh";
const VERIFY_SCRIPT_CONTAINER_PATH = `${CONTAINER_WORKSPACE_PATH}/${VERIFY_SCRIPT_RELATIVE_PATH}`;

/**
 * Runs `.fern/verify.sh` (when emitted by the generator) inside a language-specific
 * validator container. The validator image follows the convention
 * `{generatorImage}-validator:{version}` — for `fernapi/fern-typescript-sdk:3.70.2`
 * the validator is `fernapi/fern-typescript-sdk-validator:3.70.2`.
 *
 * No-ops when `.fern/verify.sh` is absent (only the TypeScript SDK generator emits
 * it today; other languages will follow up via FER-9681). When the script runs and
 * exits non-zero, the step records the failure on `result.success = false` and
 * surfaces raw stderr through the pipeline logger so the orchestrator skips
 * `GithubStep`.
 */
export class VerificationStep extends BaseStep {
    readonly name = "verify";

    constructor(
        outputDir: string,
        logger: PipelineLogger,
        private readonly config: VerifyStepConfig,
        private readonly generatorName?: string,
        private readonly generatorVersions?: Record<string, string>
    ) {
        super(outputDir, logger);
    }

    async execute(_context: PipelineContext): Promise<VerificationStepResult> {
        const verifyScriptHostPath = join(this.outputDir, VERIFY_SCRIPT_RELATIVE_PATH);
        if (!existsSync(verifyScriptHostPath)) {
            return { executed: true, success: true, skipped: true };
        }

        const validatorImage = this.deriveValidatorImage();
        if (validatorImage == null) {
            const message =
                "Cannot derive validator image: generatorName and generatorVersions are required to compute " +
                "the `{generatorImage}-validator:{version}` tag.";
            this.logger.error(message);
            return {
                executed: true,
                success: false,
                skipped: false,
                errorMessage: message
            };
        }

        const runner: ContainerRunner = this.config.runner ?? "docker";
        const dockerLogger = createDockerLoggerAdapter(this.logger);

        let containerId: string | undefined;
        try {
            try {
                containerId = await startContainer({
                    logger: dockerLogger,
                    imageName: validatorImage,
                    runner
                });
            } catch (error) {
                const message = `Failed to start verification container from image ${validatorImage}: ${extractErrorMessage(error)}`;
                this.logger.error(message);
                return {
                    executed: true,
                    success: false,
                    skipped: false,
                    errorMessage: message
                };
            }

            try {
                // Append `/.` so `docker cp` copies the *contents* of the
                // generator output dir into `/workspace`, not the dir itself
                // as a subdirectory. The validator images set
                // `WORKDIR /workspace`, so `/workspace` already exists; without
                // this, `docker cp /a/b <cid>:/workspace` results in
                // `/workspace/b/...`, leaving `.fern/verify.sh` unreachable
                // at the expected `/workspace/.fern/verify.sh` path.
                await copyToContainer({
                    logger: dockerLogger,
                    containerId,
                    hostPath: `${this.outputDir}/.`,
                    containerPath: CONTAINER_WORKSPACE_PATH,
                    runner
                });
            } catch (error) {
                const message = `Failed to copy workspace into verification container: ${extractErrorMessage(error)}`;
                this.logger.error(message);
                return {
                    executed: true,
                    success: false,
                    skipped: false,
                    errorMessage: message
                };
            }

            const { stdout, stderr, exitCode } = await execInContainer({
                logger: dockerLogger,
                containerId,
                command: ["bash", VERIFY_SCRIPT_CONTAINER_PATH],
                runner,
                writeLogsToFile: false,
                reject: false
            });

            if (exitCode !== 0) {
                const capturedStderr = stderr.length > 0 ? stderr : stdout;
                this.logger.error(
                    `Verification failed (exit code ${exitCode}) for image ${validatorImage}.\n${capturedStderr}`
                );
                return {
                    executed: true,
                    success: false,
                    skipped: false,
                    stderr: capturedStderr,
                    errorMessage: `Verification script exited with code ${exitCode}`
                };
            }

            this.logger.info(`Verification succeeded for image ${validatorImage}`);
            return { executed: true, success: true, skipped: false };
        } finally {
            if (containerId != null) {
                try {
                    await stopContainer({ logger: dockerLogger, containerId, runner });
                } catch (error) {
                    this.logger.debug(
                        `Best-effort cleanup: failed to stop verification container ${containerId}: ${extractErrorMessage(error)}`
                    );
                }
            }
        }
    }

    private deriveValidatorImage(): string | undefined {
        if (this.generatorName == null) {
            return undefined;
        }
        const version = this.generatorVersions?.[this.generatorName];
        if (version == null) {
            return undefined;
        }
        return `${this.generatorName}-validator:${version}`;
    }
}

// Bridges the pipeline's narrow `PipelineLogger` shape to `@fern-api/logger`'s
// richer `Logger` interface so it can be passed to the docker-utils functions.
function createDockerLoggerAdapter(pipelineLogger: PipelineLogger) {
    return createLogger((level, ...args) => {
        const message = args.join(" ");
        switch (level) {
            case LogLevel.Trace:
            case LogLevel.Debug:
                pipelineLogger.debug(message);
                return;
            case LogLevel.Info:
                pipelineLogger.info(message);
                return;
            case LogLevel.Warn:
                pipelineLogger.warn(message);
                return;
            case LogLevel.Error:
                pipelineLogger.error(message);
                return;
        }
    });
}
