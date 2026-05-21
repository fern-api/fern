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

        const statusBefore = this.gitStatusSnapshot();

        try {
            const result = execFileSync("bash", [scriptPath], {
                cwd: this.outputDir,
                timeout: 120_000,
                stdio: ["ignore", "pipe", "pipe"]
            });

            this.logger.debug(`Lockfile resolution output: ${result.toString().trim()}`);

            this.commitNewChanges(statusBefore);

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

    private gitStatusSnapshot(): Set<string> {
        const output = execFileSync("git", ["status", "--porcelain"], {
            cwd: this.outputDir,
            encoding: "utf-8",
            stdio: "pipe"
        }).trim();
        return new Set(output ? output.split("\n") : []);
    }

    /**
     * Stage and commit only the files that changed as a result of running the
     * lockfile script, not pre-existing uncommitted files. Compares a before/after
     * snapshot of `git status --porcelain` and only stages new or modified entries.
     */
    private commitNewChanges(statusBefore: Set<string>): void {
        const statusAfter = this.gitStatusSnapshot();

        const newEntries: string[] = [];
        for (const entry of statusAfter) {
            if (!statusBefore.has(entry)) {
                // porcelain format: "XY path" — extract the path after the 3-char prefix
                const filePath = entry.slice(3);
                if (filePath.length > 0) {
                    newEntries.push(filePath);
                }
            }
        }

        if (newEntries.length === 0) {
            this.logger.debug("Lockfile unchanged — nothing to commit.");
            return;
        }

        for (const filePath of newEntries) {
            execFileSync("git", ["add", "--", filePath], {
                cwd: this.outputDir,
                stdio: "pipe"
            });
        }

        execFileSync("git", ["commit", "-m", "[fern-lockfile] Re-resolve lockfile"], {
            cwd: this.outputDir,
            stdio: "pipe"
        });

        this.logger.info(`Committed lockfile changes as [fern-lockfile]: ${newEntries.join(", ")}`);
    }
}
