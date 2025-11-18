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
import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { FernCliError, TaskContext } from "@fern-api/task-context";
import { exec } from "child_process";
import { promisify } from "util";
import { CliContext } from "../../cli-context/CliContext";

const execAsync = promisify(exec);

async function getClientRegistry(context: CliContext, project: Project): Promise<ClientRegistry> {
    // Get the first API workspace (or we could make this configurable)
    const workspace = project.apiWorkspaces[0];
    if (workspace == null) {
        context.failAndThrow("No API workspaces found in the project.");
    }

    // Load generators configuration to get AI service settings
    const generatorsConfig = await loadGeneratorsConfiguration({
        absolutePathToWorkspace: workspace.absoluteFilePath,
        // TODO(tjb9dc): Remove the need for this cast
        context: context as unknown as TaskContext
    });

    if (generatorsConfig == null) {
        context.failAndThrow("Could not find generators.yml in the workspace. Is this a valid fern project?");
    }

    // Check if AI services configuration exists
    if (generatorsConfig.ai == null) {
        context.failAndThrow(
            "No AI service configuration found in generators.yml. Please add an 'ai' section with provider and model."
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
        context.failWithoutThrowing(`Directory not found: ${fromPath}`);
        throw new FernCliError();
    }

    if (!(await doesPathExist(toPath, "directory"))) {
        context.failWithoutThrowing(`Directory not found: ${toPath}`);
        throw new FernCliError();
    }

    const clientRegistry = await getClientRegistry(context, project);

    // Generate git diff between the two directories
    context.logger.info("Generating diff between directories...");
    const gitDiff = await generateDiff({ context, fromPath, toPath });

    if (!gitDiff || gitDiff.trim().length === 0) {
        context.logger.warn("No differences found between the directories");
        return {
            message: "No changes detected between the directories",
            version_bump: VersionBump.NO_CHANGE
        };
    }

    context.logger.debug(`Generated diff (${gitDiff.length} characters)`);

    // Analyze the diff using LLM with the configured client
    context.logger.info("Analyzing diff with LLM...");
    try {
        // Create a BAML client with options if we have a custom registry
        const bamlClient = BamlClient.withOptions({ clientRegistry });

        const analysis = await bamlClient.AnalyzeSdkDiff({
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
        return context.failAndThrow(
            `Failed to generate diff: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
