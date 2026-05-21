import { ContainerRunner, extractErrorMessage } from "@fern-api/core-utils";
import {
    copyFromContainer,
    copyToContainer,
    execInContainer,
    startContainer,
    stopContainer
} from "@fern-api/docker-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import type { PipelineLogger } from "../PipelineLogger";
import type { LockfileStepConfig, LockfileStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

const CONTAINER_WORKSPACE_PATH = "/workspace";
const LOCKFILE_SCRIPT_RELATIVE_PATH = ".fern/regenerate-lockfile.sh";
const LOCKFILE_SCRIPT_CONTAINER_PATH = `${CONTAINER_WORKSPACE_PATH}/${LOCKFILE_SCRIPT_RELATIVE_PATH}`;

/** Known lockfile filenames, checked in order. */
const LOCKFILE_CANDIDATES = ["pnpm-lock.yaml", "yarn.lock"];

/**
 * Regenerates the package-manager lockfile inside the validator container so
 * it reflects the final `package.json` — including any edits from ReplayStep,
 * `.fernignore` preservation, or per-SDK manifest customizations.
 *
 * No-ops when `.fern/regenerate-lockfile.sh` is absent (only the TypeScript
 * SDK generator emits it today).
 */
export class LockfileStep extends BaseStep {
    readonly name = "lockfile";

    constructor(
        outputDir: string,
        logger: PipelineLogger,
        private readonly config: LockfileStepConfig,
        private readonly generatorName?: string,
        private readonly generatorVersions?: Record<string, string>
    ) {
        super(outputDir, logger);
    }

    async execute(_context: PipelineContext): Promise<LockfileStepResult> {
        const scriptHostPath = join(this.outputDir, LOCKFILE_SCRIPT_RELATIVE_PATH);
        if (!existsSync(scriptHostPath)) {
            return { executed: true, success: true, skipped: true };
        }

        const validatorImage = this.deriveValidatorImage();
        if (validatorImage == null) {
            this.logger.warn(
                "Cannot derive validator image for lockfile regeneration: generatorName and generatorVersions are required."
            );
            return { executed: true, success: true, skipped: true };
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
                const message = `Failed to start lockfile container from image ${validatorImage}: ${extractErrorMessage(error)}`;
                this.logger.error(message);
                return { executed: true, success: false, skipped: false, errorMessage: message };
            }

            try {
                await copyToContainer({
                    logger: dockerLogger,
                    containerId,
                    hostPath: `${this.outputDir}/.`,
                    containerPath: CONTAINER_WORKSPACE_PATH,
                    runner
                });
            } catch (error) {
                const message = `Failed to copy workspace into lockfile container: ${extractErrorMessage(error)}`;
                this.logger.error(message);
                return { executed: true, success: false, skipped: false, errorMessage: message };
            }

            const { stderr, exitCode } = await execInContainer({
                logger: dockerLogger,
                containerId,
                command: ["bash", LOCKFILE_SCRIPT_CONTAINER_PATH],
                runner,
                writeLogsToFile: false,
                reject: false
            });

            if (exitCode !== 0) {
                const message = `Lockfile regeneration failed (exit code ${exitCode}): ${stderr}`;
                this.logger.error(message);
                return { executed: true, success: false, skipped: false, errorMessage: message };
            }

            // Copy the regenerated lockfile back from the container.
            let lockfileCopied = false;
            for (const candidate of LOCKFILE_CANDIDATES) {
                const containerLockfilePath = `${CONTAINER_WORKSPACE_PATH}/${candidate}`;
                try {
                    await copyFromContainer({
                        logger: dockerLogger,
                        containerId,
                        containerPath: containerLockfilePath,
                        hostPath: join(this.outputDir, candidate),
                        runner
                    });
                    lockfileCopied = true;
                    this.logger.info(`Copied regenerated ${candidate} back from container`);
                    break;
                } catch (error) {
                    this.logger.debug(
                        `Lockfile candidate ${candidate} not found in container: ${extractErrorMessage(error)}`
                    );
                }
            }

            if (!lockfileCopied) {
                this.logger.warn("Lockfile script ran but no known lockfile was produced");
                return { executed: true, success: true, skipped: false };
            }

            // Commit the updated lockfile if the output directory is a git repo
            // and there are uncommitted changes (e.g. after ReplayStep committed).
            this.commitLockfileIfNeeded();

            this.logger.info("Lockfile regeneration succeeded");
            return { executed: true, success: true, skipped: false };
        } finally {
            if (containerId != null) {
                try {
                    await stopContainer({ logger: dockerLogger, containerId, runner });
                } catch (error) {
                    this.logger.debug(
                        `Best-effort cleanup: failed to stop lockfile container ${containerId}: ${extractErrorMessage(error)}`
                    );
                }
            }
        }
    }

    private commitLockfileIfNeeded(): void {
        try {
            // Check if inside a git repository.
            execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
                cwd: this.outputDir,
                stdio: "pipe"
            });
        } catch (error) {
            this.logger.debug(`Not inside a git repository, skipping lockfile commit: ${extractErrorMessage(error)}`);
            return;
        }

        try {
            // Stage lockfile changes and check if there's anything to commit.
            for (const candidate of LOCKFILE_CANDIDATES) {
                try {
                    execFileSync("git", ["add", candidate], {
                        cwd: this.outputDir,
                        stdio: "pipe"
                    });
                } catch (error) {
                    this.logger.debug(
                        `Lockfile candidate ${candidate} not present on disk, skipping git add: ${extractErrorMessage(error)}`
                    );
                }
            }
            const diff = execFileSync("git", ["diff", "--cached", "--name-only"], {
                cwd: this.outputDir,
                encoding: "utf-8",
                stdio: "pipe"
            }).trim();

            if (diff.length > 0) {
                execFileSync("git", ["commit", "-m", "[fern-lockfile] regenerate lockfile after replay"], {
                    cwd: this.outputDir,
                    stdio: "pipe"
                });
                this.logger.debug("Committed lockfile update as [fern-lockfile]");
            }
        } catch (error) {
            this.logger.debug(`Best-effort lockfile commit failed: ${extractErrorMessage(error)}`);
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
