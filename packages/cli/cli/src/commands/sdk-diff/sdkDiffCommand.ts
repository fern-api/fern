/**
 * SDK Diff Command
 *
 * Compares two directories containing Fern-generated SDKs and produces:
 * - A semantic commit message (headline + description)
 * - A version bump recommendation (major/minor/patch)
 */

import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import { FernCliError } from "@fern-api/task-context";
import { exec } from "child_process";
import { promisify } from "util";
import { CliContext } from "../../cli-context/CliContext";
import { AnalyzeCommitDiffResponse, b as BamlClient, VersionBump } from "@fern-api/cli-ai";

const execAsync = promisify(exec);


/**
 * Executes the SDK diff command by comparing two directories and analyzing the differences
 */
export async function sdkDiffCommand({
    context,
    fromDir,
    toDir
}: {
    context: CliContext;
    fromDir: string;
    toDir: string;
}): Promise<AnalyzeCommitDiffResponse> {
    // Resolve and validate paths
    const fromPath = AbsoluteFilePath.of(resolve(cwd(), fromDir));
    const toPath = AbsoluteFilePath.of(resolve(cwd(), toDir));

    context.logger.debug(`Comparing directories:
  From: ${fromPath}
  To:   ${toPath}`);

    // Validate that both directories exist
    if (!(await doesPathExist(fromPath, "directory"))) {
        context.failWithoutThrowing(`Directory not found: ${fromPath}`);
        throw new FernCliError();
    }

    if (!(await doesPathExist(toPath, "directory"))) {
        context.failWithoutThrowing(`Directory not found: ${toPath}`);
        throw new FernCliError();
    }

    // Generate git diff between the two directories
    context.logger.info("Generating diff between directories...");
    const gitDiff = await generateDiff(fromPath, toPath);

    if (!gitDiff || gitDiff.trim().length === 0) {
        context.logger.warn("No differences found between the directories");
        return {
            message: "No changes detected between the directories",
            version_bump: VersionBump.NO_CHANGE
        };
    }

    context.logger.debug(`Generated diff (${gitDiff.length} characters)`);

    // Analyze the diff using LLM
    context.logger.info("Analyzing diff with LLM...");
    try {
        const analysis = await BamlClient.AnalyzeSdkDiff({
            diff: gitDiff
        });
        context.logger.debug("Analysis complete");
        return analysis;
    } catch (error) {
        context.failWithoutThrowing(
            `Failed to analyze SDK diff: ${error instanceof Error ? error.message : String(error)}`
        );
        throw new FernCliError();
    }
}

/**
 * Generates a git diff between two directories
 * Uses git diff --no-index to compare directories without requiring a git repository
 */
async function generateDiff(fromPath: string, toPath: string): Promise<string> {
    try {
        // Use git diff --no-index to compare directories
        // This works even outside a git repository
        const { stdout } = await execAsync(
            `git diff --no-index --no-color --no-ext-diff "${fromPath}" "${toPath}"`,
            {
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large diffs
                encoding: "utf-8"
            }
        );
        return stdout;
    } catch (error: any) {
        // git diff --no-index returns exit code 1 when there are differences
        // This is expected behavior, so we check if stdout contains the diff
        if (error.code === 1 && error.stdout) {
            return error.stdout;
        }
        // For other errors, throw
        throw new Error(`Failed to generate diff: ${error.message}`);
    }
}
