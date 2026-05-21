import { extractErrorMessage } from "@fern-api/core-utils";
import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import type { LockfileResolutionStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

const RESOLVE_LOCKFILE_RELATIVE_PATH = ".fern/resolve-lockfile.sh";

/**
 * Runs `.fern/resolve-lockfile.sh` (when emitted by the generator) to regenerate
 * the package-manager lockfile after ReplayStep has applied customer patches.
 *
 * This ensures the lockfile reflects any dependency changes introduced by replay
 * patches or `.fernignore`-preserved manifest files.
 *
 * No-ops when `.fern/resolve-lockfile.sh` is absent (only Python emits it today;
 * other languages will follow via sibling FER-10687 subissues).
 */
export class LockfileResolutionStep extends BaseStep {
    readonly name = "lockfileResolution";

    async execute(_context: PipelineContext): Promise<LockfileResolutionStepResult> {
        const scriptPath = join(this.outputDir, RESOLVE_LOCKFILE_RELATIVE_PATH);
        if (!existsSync(scriptPath)) {
            return { executed: true, success: true, skipped: true };
        }

        this.logger.info("Re-resolving lockfile after customization steps...");

        try {
            const result = execFileSync("bash", [scriptPath], {
                cwd: this.outputDir,
                timeout: 120_000,
                stdio: ["ignore", "pipe", "pipe"]
            });

            this.logger.debug(`Lockfile resolution output: ${result.toString().trim()}`);

            return { executed: true, success: true, skipped: false };
        } catch (error) {
            const message = `Lockfile resolution failed: ${extractErrorMessage(error)}`;
            this.logger.warn(message);
            // Non-fatal: generation can proceed with the pre-replay lockfile.
            // The lockfile may be stale but the SDK is still usable.
            return {
                executed: true,
                success: true,
                skipped: false,
                errorMessage: message
            };
        }
    }
}
