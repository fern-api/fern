import { extractErrorMessage } from "@fern-api/core-utils";
import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import type { LockfileStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

const LOCKFILE_SCRIPT_RELATIVE_PATH = ".fern/lockfile.sh";

/**
 * Runs `.fern/lockfile.sh` (when emitted by the generator) to resolve
 * dependency lockfiles (e.g. `go.sum`) AFTER customizations (replay patches,
 * `.fernignore`) have been applied. This ensures the committed lockfile
 * matches the final manifest state.
 *
 * No-ops when `.fern/lockfile.sh` is absent — only generators that produce
 * lockfiles emit this script (Go today; other languages may follow).
 */
export class LockfileStep extends BaseStep {
    readonly name = "lockfile";

    async execute(_context: PipelineContext): Promise<LockfileStepResult> {
        const scriptPath = join(this.outputDir, LOCKFILE_SCRIPT_RELATIVE_PATH);
        if (!existsSync(scriptPath)) {
            return { executed: true, success: true, skipped: true };
        }

        this.logger.info("Running lockfile resolution script...");

        try {
            execFileSync("bash", [scriptPath], {
                cwd: this.outputDir,
                stdio: ["ignore", "pipe", "pipe"],
                timeout: 120_000
            });
            this.logger.info("Lockfile resolution completed successfully.");
            return { executed: true, success: true, skipped: false };
        } catch (error) {
            const message = `Lockfile resolution failed: ${extractErrorMessage(error)}`;
            this.logger.error(message);
            return {
                executed: true,
                success: false,
                skipped: false,
                errorMessage: message
            };
        }
    }
}
