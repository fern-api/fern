import { execFileSync } from "child_process";
import type { PipelineLogger } from "../PipelineLogger";
import type { LockfileStepConfig, LockfileStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

/**
 * Resolves the package manager lockfile (e.g., `poetry.lock`) after
 * customizations (ReplayStep, FernignoreStep) have been applied. This ensures
 * the lockfile reflects the final `pyproject.toml` / `package.json` state,
 * including any replay patches or `.fernignore` modifications.
 *
 * No-ops when the step is not configured or when `enabled` is false.
 */
export class LockfileStep extends BaseStep {
    readonly name = "lockfile";

    constructor(
        outputDir: string,
        logger: PipelineLogger,
        private readonly config: LockfileStepConfig
    ) {
        super(outputDir, logger);
    }

    async execute(_context: PipelineContext): Promise<LockfileStepResult> {
        const [executable, ...args] = this.config.command;
        if (executable == null) {
            return { executed: true, success: true, skipped: true };
        }

        this.logger.info(`Running lockfile resolution: ${this.config.command.join(" ")}`);

        try {
            execFileSync(executable, args, {
                cwd: this.outputDir,
                stdio: "pipe"
            });
            this.logger.info("Lockfile resolution completed successfully");
            return { executed: true, success: true, skipped: false };
        } catch (error) {
            const stderr = error instanceof Error && "stderr" in error ? String((error as any).stderr) : "";
            const message = `Lockfile resolution failed: ${stderr || (error instanceof Error ? error.message : String(error))}`;
            this.logger.error(message);
            return { executed: true, success: false, skipped: false, errorMessage: message };
        }
    }
}
