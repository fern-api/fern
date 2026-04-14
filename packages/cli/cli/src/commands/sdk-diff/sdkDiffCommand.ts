/**
 * SDK Diff Command
 *
 * Compares two directories containing Fern-generated SDKs and produces:
 * - A semantic commit message (headline + description)
 * - A version bump recommendation (major/minor/patch)
 */

import { ClientRegistry } from "@boundaryml/baml";
import { AnalyzeCommitDiffResponse, b as BamlClient, configureBamlClient, VersionBump } from "@fern-api/cli-ai";
import { loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import {
    AutoVersioningService,
    countFilesInDiff,
    formatSizeKB,
    MAX_AI_DIFF_BYTES,
    MAX_CHUNKS,
    MAX_RAW_DIFF_BYTES,
    maxVersionBump
} from "@fern-api/local-workspace-runner";
import { Project } from "@fern-api/project-loader";
import { CliError, TaskAbortSignal, TaskContext } from "@fern-api/task-context";
import { exec } from "child_process";
import { promisify } from "util";
import { CliContext } from "../../cli-context/CliContext.js";

const execAsync = promisify(exec);

async function getClientRegistry(context: CliContext, project: Project): Promise<ClientRegistry> {
    // Get the first API workspace (or we could make this configurable)
    const workspace = project.apiWorkspaces[0];
    if (workspace == null) {
        context.failAndThrow("No API workspaces found in the project.", undefined, { code: CliError.Code.ConfigError });
    }

    // Load generators configuration to get AI service settings
    const generatorsConfig = await loadGeneratorsConfiguration({
        absolutePathToWorkspace: workspace.absoluteFilePath,
        // TODO(tjb9dc): Remove the need for this cast
        context: context as unknown as TaskContext
    });

    if (generatorsConfig == null) {
        context.failAndThrow(
            "Could not find generators.yml in the workspace. Is this a valid fern project?",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    // Check if AI services configuration exists
    if (generatorsConfig.ai == null) {
        context.failAndThrow(
            "No AI service configuration found in generators.yml. Please add an 'ai' section with provider and model.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    context.logger.debug(`Using AI service: ${generatorsConfig.ai.provider} with model ${generatorsConfig.ai.model}`);
    return configureBamlClient(generatorsConfig.ai);
}

/**
 * Executes the SDK diff command by comparing two directories and analyzing the differences
 */
export async function sdkDiffCommand({
    context,
    project,
    fromDir,
    toDir
}: {
    context: CliContext;
    project: Project;
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
        context.failWithoutThrowing(`Directory not found: ${fromPath}`, undefined, { code: CliError.Code.ConfigError });
        throw new TaskAbortSignal();
    }

    if (!(await doesPathExist(toPath, "directory"))) {
        context.failWithoutThrowing(`Directory not found: ${toPath}`, undefined, { code: CliError.Code.ConfigError });
        throw new TaskAbortSignal();
    }

    const clientRegistry = await getClientRegistry(context, project);

    // Generate git diff between the two directories
    context.logger.info("Generating diff between directories...");
    const gitDiff = await generateDiff({ context, fromPath, toPath });

    if (!gitDiff || gitDiff.trim().length === 0) {
        context.logger.warn("No differences found between the directories");
        return {
            message: "No changes detected between the directories",
            changelog_entry: "",
            version_bump: VersionBump.NO_CHANGE,
            version_bump_reason: "No functional changes detected."
        };
    }

    const diffSizeKB = formatSizeKB(gitDiff.length);
    const fileCount = countFilesInDiff(gitDiff);
    context.logger.debug(`Generated diff: ${diffSizeKB}KB (${gitDiff.length} chars), ${fileCount} files changed`);

    // Reject absurdly large diffs before chunking
    const service = new AutoVersioningService({ logger: context.logger });
    const diffBytes = Buffer.byteLength(gitDiff, "utf-8");
    if (diffBytes > MAX_RAW_DIFF_BYTES) {
        return context.failAndThrow(
            `Diff too large for analysis (${(diffBytes / 1_000_000).toFixed(1)}MB, ` +
                `limit ${MAX_RAW_DIFF_BYTES / 1_000_000}MB). Try excluding generated files or splitting the comparison.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    // Chunk the diff if it exceeds the per-call limit
    const chunks = diffBytes > MAX_AI_DIFF_BYTES ? service.chunkDiff(gitDiff, MAX_AI_DIFF_BYTES) : [gitDiff];
    const cappedChunks = chunks.slice(0, MAX_CHUNKS);
    const skippedChunks = chunks.length - cappedChunks.length;

    if (cappedChunks.length > 1) {
        context.logger.info(
            `Diff too large for single AI call (${diffBytes} bytes). ` +
                `Split into ${chunks.length} chunks for analysis` +
                (skippedChunks > 0 ? ` (capped at ${MAX_CHUNKS}, skipping ${skippedChunks} low-priority chunks).` : ".")
        );
    }

    // Analyze the diff using LLM with the configured client
    context.logger.info("Analyzing diff with LLM...");
    try {
        const bamlClient = BamlClient.withOptions({ clientRegistry });

        if (cappedChunks.length <= 1) {
            // Single chunk — standard path
            const analysis = await bamlClient.AnalyzeSdkDiff(cappedChunks[0] ?? gitDiff, "unknown", "0.0.0", "", "");
            context.logger.debug("Analysis complete");
            return analysis;
        }

        // Multi-chunk analysis — analyze each chunk, merge results
        let bestBump: string = VersionBump.NO_CHANGE;
        let bestMessage = "";
        let bestVersionBumpReason = "";
        const allChangelogEntries: string[] = [];

        for (let i = 0; i < cappedChunks.length; i++) {
            const chunk = cappedChunks[i];
            if (chunk == null) {
                continue;
            }
            context.logger.debug(
                `Analyzing chunk ${i + 1}/${cappedChunks.length} ` + `(${Buffer.byteLength(chunk, "utf-8")} bytes)`
            );

            const chunkAnalysis = await bamlClient.AnalyzeSdkDiff(chunk, "unknown", "0.0.0", "", "");

            if (chunkAnalysis.version_bump === VersionBump.NO_CHANGE) {
                context.logger.debug(`Chunk ${i + 1} result: NO_CHANGE`);
                continue;
            }

            const prevBest = bestBump;
            bestBump = maxVersionBump(bestBump, chunkAnalysis.version_bump);

            if (bestBump !== prevBest) {
                bestMessage = chunkAnalysis.message;
                bestVersionBumpReason = chunkAnalysis.version_bump_reason?.trim() || "";
            }

            const entry = chunkAnalysis.changelog_entry?.trim();
            if (entry) {
                allChangelogEntries.push(entry);
            }

            context.logger.debug(
                `Chunk ${i + 1} result: ${chunkAnalysis.version_bump}` +
                    (bestBump !== prevBest ? ` (new highest: ${bestBump})` : "")
            );
        }

        context.logger.debug("Multi-chunk analysis complete");

        if (bestBump === VersionBump.NO_CHANGE) {
            return {
                version_bump: VersionBump.NO_CHANGE,
                message: "No changes detected between the directories",
                changelog_entry: "",
                version_bump_reason: "No functional changes detected."
            };
        }

        let changelogEntry: string;
        let versionBumpReason = bestVersionBumpReason;
        if (allChangelogEntries.length > 1) {
            // Consolidate repetitive multi-chunk entries via AI rollup
            const rawEntries = allChangelogEntries.map((e) => (e.startsWith("- ") ? e : `- ${e}`)).join("\n");
            try {
                context.logger.debug(`Consolidating ${allChangelogEntries.length} changelog entries via AI rollup`);
                const rollup = await bamlClient.ConsolidateChangelog(rawEntries, bestBump, "unknown");
                changelogEntry = rollup.consolidated_changelog?.trim() || rawEntries;
                versionBumpReason = rollup.version_bump_reason?.trim() || "";
            } catch (rollupError) {
                context.logger.warn(
                    `Changelog consolidation failed, using raw entries: ${extractErrorMessage(rollupError)}`
                );
                changelogEntry = rawEntries;
            }
        } else {
            changelogEntry = allChangelogEntries[0] ?? "";
            versionBumpReason = bestVersionBumpReason;
        }

        return {
            version_bump: bestBump as VersionBump,
            message: bestMessage || "SDK regeneration",
            changelog_entry: changelogEntry,
            version_bump_reason: versionBumpReason
        };
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        context.failWithoutThrowing(
            `Failed to analyze SDK diff. ` +
                `Diff stats: ${gitDiff.length.toLocaleString()} chars, ${diffSizeKB}KB, ${fileCount} files changed. ` +
                (cappedChunks.length > 1
                    ? `The diff was split into ${cappedChunks.length} chunks but analysis still failed. `
                    : "") +
                `Error: ${errorMessage}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
        throw new TaskAbortSignal();
    }
}

/**
 * Generates a git diff between two directories
 * Uses git diff --no-index to compare directories without requiring a git repository
 */
async function generateDiff({
    context,
    fromPath,
    toPath
}: {
    context: CliContext;
    fromPath: string;
    toPath: string;
}): Promise<string> {
    try {
        // Use git diff --no-index to compare directories
        // This works even outside a git repository
        const { stdout } = await execAsync(`git diff --no-index --no-color --no-ext-diff "${fromPath}" "${toPath}"`, {
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large diffs
            encoding: "utf-8"
        });
        return stdout;
    } catch (error: unknown) {
        // git diff --no-index returns exit code 1 when there are differences
        // This is expected behavior, so we check if stdout contains the diff
        if (
            typeof error === "object" &&
            error != null &&
            "code" in error &&
            error.code === 1 &&
            "stdout" in error &&
            typeof error.stdout === "string"
        ) {
            return error.stdout;
        }
        // For other errors, throw
        return context.failAndThrow(`Failed to generate diff: ${extractErrorMessage(error)}`, undefined, {
            code: CliError.Code.InternalError
        });
    }
}
