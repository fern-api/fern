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

            this.commitIfChanged();

            return { executed: true, success: true, skipped: false };
        } catch (error) {
            const message = `Lockfile resolution failed: ${extractErrorMessage(error)}`;
            this.logger.warn(message);
            return {
                executed: true,
                success: true,
                skipped: false,
                errorMessage: message
            };
        }
    }

    /**
     * Stage and commit lockfile changes so they are included when GithubStep
     * pushes — even when `skipCommit` is true (replay already committed).
     * No-ops when the working tree is clean.
     */
    private commitIfChanged(): void {
        const hasChanges =
            execFileSync("git", ["status", "--porcelain"], {
                cwd: this.outputDir,
                encoding: "utf-8",
                stdio: "pipe"
            }).trim().length > 0;

        if (!hasChanges) {
            this.logger.debug("Lockfile unchanged — nothing to commit.");
            return;
        }

        execFileSync("git", ["add", "-A"], {
            cwd: this.outputDir,
            stdio: "pipe"
        });

        execFileSync("git", ["commit", "-m", "[fern-lockfile] Re-resolve lockfile"], {
            cwd: this.outputDir,
            stdio: "pipe"
        });

        this.logger.info("Committed lockfile changes as [fern-lockfile].");
    }
}
