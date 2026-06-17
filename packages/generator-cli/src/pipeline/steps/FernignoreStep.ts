import { expandFernignorePatterns } from "@fern-api/github";
import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import type { FernignoreStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

/**
 * Preserves files listed in `.fernignore` during regeneration.
 *
 * When replay is active, `GenerationCommitStep` commits `[fern-generated]`
 * which includes ALL generator output — even files the user intended to manage
 * themselves (listed in `.fernignore`). This step runs after `ReplayStep` and
 * restores those protected files to their pre-generation state.
 *
 * Without replay, the generator's output sits uncommitted in the working tree.
 * The step restores fernignored files from HEAD so that the subsequent
 * `GithubStep.commitAllChanges()` does not include them.
 *
 * Restoration logic mirrors the git rm/reset/restore flow in
 * `LocalTaskHandler.copyGeneratedFilesWithFernIgnoreInExistingRepo`, adapted
 * for the post-commit pipeline context.
 */
export class FernignoreStep extends BaseStep {
    readonly name = "fernignore";

    async execute(context: PipelineContext): Promise<FernignoreStepResult> {
        const fernignorePath = join(this.outputDir, ".fernignore");
        if (!existsSync(fernignorePath)) {
            this.logger.debug("No .fernignore file found — skipping");
            return { executed: true, success: true, pathsPreserved: [] };
        }

        const fernignoreContent = readFileSync(fernignorePath, "utf-8");
        const patterns = fernignoreContent
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.startsWith("#"));

        if (patterns.length === 0) {
            this.logger.debug(".fernignore has no patterns — skipping");
            return { executed: true, success: true, pathsPreserved: [] };
        }

        // With replay: the [fern-generated] commit overwrote fernignored files.
        // Restore from its parent (the pre-generation working tree).
        // Without replay: generator output is uncommitted. Restore from HEAD.
        const generationCommitSha = context.previousStepResults.generationCommit?.currentGenerationSha;
        let restoreSource: string;
        if (generationCommitSha != null) {
            const parentSha = this.git(["rev-parse", `${generationCommitSha}^`]);
            if (parentSha == null) {
                this.logger.warn("Could not determine pre-generation commit — skipping fernignore preservation");
                return { executed: true, success: true, pathsPreserved: [] };
            }
            restoreSource = parentSha;
        } else {
            restoreSource = "HEAD";
        }

        // List all tracked files at HEAD to match against fernignore patterns.
        const trackedOutput = this.git(["ls-tree", "-r", "HEAD", "--name-only"]);
        const trackedFiles = trackedOutput != null ? trackedOutput.split("\n").filter(Boolean) : [];

        const matchingFiles = expandFernignorePatterns(fernignoreContent, trackedFiles);
        if (matchingFiles.length === 0) {
            this.logger.debug("No tracked files match .fernignore patterns — skipping");
            return { executed: true, success: true, pathsPreserved: [] };
        }

        this.logger.debug(`Found ${matchingFiles.length} file(s) matching .fernignore patterns`);

        // Separate files into those that existed pre-generation (restore) vs
        // newly generated files that landed in a fernignored path (remove).
        const filesToRestore: string[] = [];
        const filesToRemove: string[] = [];
        for (const file of matchingFiles) {
            if (this.gitSucceeds(["cat-file", "-e", `${restoreSource}:${file}`])) {
                filesToRestore.push(file);
            } else {
                filesToRemove.push(file);
            }
        }

        const preservedPaths: string[] = [];

        if (filesToRestore.length > 0) {
            if (this.git(["checkout", restoreSource, "--", ...filesToRestore]) != null) {
                preservedPaths.push(...filesToRestore);
            } else {
                // Batch failed — try one by one
                for (const file of filesToRestore) {
                    if (this.git(["checkout", restoreSource, "--", file]) != null) {
                        preservedPaths.push(file);
                    } else {
                        this.logger.warn(`Failed to restore fernignored file: ${file}`);
                    }
                }
            }
        }

        for (const file of filesToRemove) {
            if (this.git(["rm", "-f", "--", file]) != null) {
                preservedPaths.push(file);
            }
        }

        if (preservedPaths.length === 0) {
            this.logger.debug("No fernignored files needed restoration");
            return { executed: true, success: true, pathsPreserved: [] };
        }

        this.logger.info(
            `Preserved ${preservedPaths.length} .fernignore-protected file(s): ${preservedPaths.join(", ")}`
        );

        // When replay committed (generation commit exists), GithubStep won't call
        // commitAllChanges — commit the restoration so it lands on the branch.
        if (generationCommitSha != null && this.hasStagedChanges()) {
            this.git(["commit", "--no-verify", "-m", "[fern-fernignore] Preserve .fernignore-protected files"]);
        }

        return { executed: true, success: true, pathsPreserved: preservedPaths };
    }

    private hasStagedChanges(): boolean {
        return !this.gitSucceeds(["diff", "--cached", "--quiet"]);
    }

    private gitSucceeds(args: string[]): boolean {
        try {
            execFileSync("git", args, {
                cwd: this.outputDir,
                encoding: "utf-8",
                stdio: "pipe"
            });
            return true;
        } catch {
            return false;
        }
    }

    private git(args: string[]): string | null {
        try {
            return execFileSync("git", args, {
                cwd: this.outputDir,
                encoding: "utf-8",
                stdio: "pipe"
            }).trim();
        } catch {
            return null;
        }
    }
}
