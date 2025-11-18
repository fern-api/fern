import { ClientRegistry } from "@boundaryml/baml";
import { b as BamlClient, configureBamlClient, VersionBump } from "@fern-api/cli-ai";
import { FERNIGNORE_FILENAME } from "@fern-api/configuration";
import { AiServicesSchema } from "@fern-api/configuration/src/generators-yml";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import decompress from "decompress";
import { cp, readdir, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import semver from "semver";
import tmp from "tmp-promise";
import { AutoVersioningException, AutoVersioningService, AutoVersionResult } from "./AutoVersioningService";
import { isAutoVersion } from "./VersionUtils";

export declare namespace LocalTaskHandler {
    export interface Init {
        context: TaskContext;
        absolutePathToTmpOutputDirectory: AbsoluteFilePath;
        absolutePathToTmpSnippetJSON: AbsoluteFilePath | undefined;
        absolutePathToLocalSnippetTemplateJSON: AbsoluteFilePath | undefined;
        absolutePathToLocalOutput: AbsoluteFilePath;
        absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined;
        absolutePathToTmpSnippetTemplatesJSON: AbsoluteFilePath | undefined;
        version: string | undefined;
        ai: AiServicesSchema | undefined;
    }
}

export class LocalTaskHandler {
    private context: TaskContext;
    private absolutePathToTmpOutputDirectory: AbsoluteFilePath;
    private absolutePathToTmpSnippetJSON: AbsoluteFilePath | undefined;
    private absolutePathToTmpSnippetTemplatesJSON: AbsoluteFilePath | undefined;
    private absolutePathToLocalSnippetTemplateJSON: AbsoluteFilePath | undefined;
    private absolutePathToLocalOutput: AbsoluteFilePath;
    private absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined;
    private version: string | undefined;
    private ai: AiServicesSchema | undefined;

    constructor({
        context,
        absolutePathToTmpOutputDirectory,
        absolutePathToTmpSnippetJSON,
        absolutePathToLocalSnippetTemplateJSON,
        absolutePathToLocalOutput,
        absolutePathToLocalSnippetJSON,
        absolutePathToTmpSnippetTemplatesJSON,
        version,
        ai
    }: LocalTaskHandler.Init) {
        this.context = context;
        this.absolutePathToLocalOutput = absolutePathToLocalOutput;
        this.absolutePathToTmpOutputDirectory = absolutePathToTmpOutputDirectory;
        this.absolutePathToTmpSnippetJSON = absolutePathToTmpSnippetJSON;
        this.absolutePathToLocalSnippetJSON = absolutePathToLocalSnippetJSON;
        this.absolutePathToLocalSnippetTemplateJSON = absolutePathToLocalSnippetTemplateJSON;
        this.absolutePathToTmpSnippetTemplatesJSON = absolutePathToTmpSnippetTemplatesJSON;
        this.version = version;
        this.ai = ai;
    }

    public async copyGeneratedFiles(): Promise<{ shouldCommit: boolean; autoVersioningCommitMessage?: string }> {
        const isFernIgnorePresent = await this.isFernIgnorePresent();
        const isExistingGitRepo = await this.isGitRepository();

        if (isFernIgnorePresent && isExistingGitRepo) {
            await this.copyGeneratedFilesWithFernIgnoreInExistingRepo();
        } else if (isFernIgnorePresent && !isExistingGitRepo) {
            await this.copyGeneratedFilesWithFernIgnoreInTempRepo();
        } else if (!isFernIgnorePresent && isExistingGitRepo) {
            await this.copyGeneratedFilesNoFernIgnorePreservingGit();
        } else {
            await this.copyGeneratedFilesNoFernIgnoreDeleteAll();
        }

        if (
            this.absolutePathToTmpSnippetJSON != null &&
            this.absolutePathToLocalSnippetJSON != null &&
            (await doesPathExist(this.absolutePathToTmpSnippetJSON))
        ) {
            await this.copySnippetJSON({
                absolutePathToTmpSnippetJSON: this.absolutePathToTmpSnippetJSON,
                absolutePathToLocalSnippetJSON: this.absolutePathToLocalSnippetJSON
            });
        }

        // Handle automatic semantic versioning if version is AUTO
        if (this.version != null && isAutoVersion(this.version)) {
            const autoVersioningService = new AutoVersioningService({ logger: this.context.logger });
            const autoVersionResult = await this.handleAutoVersioning();
            if (autoVersionResult == null) {
                this.context.logger.info("No semantic changes detected. Skipping GitHub operations.");
                return { shouldCommit: false, autoVersioningCommitMessage: undefined };
            }
            // Replace magic version with computed version
            await autoVersioningService.replaceMagicVersion(
                this.absolutePathToLocalOutput,
                this.version,
                autoVersionResult.version
            );
            return { shouldCommit: true, autoVersioningCommitMessage: autoVersionResult.commitMessage };
        }
        return { shouldCommit: true, autoVersioningCommitMessage: undefined };
    }

    /**
     * Handles automatic semantic versioning by analyzing the git diff with AI.
     * Returns the final version to use and the commit message, or null if NO_CHANGE.
     */
    private async handleAutoVersioning(): Promise<AutoVersionResult | null> {
        const autoVersioningService = new AutoVersioningService({ logger: this.context.logger });
        let diffFile: string | undefined;

        try {
            this.context.logger.info("Analyzing SDK changes for automatic semantic versioning");

            // Generate git diff to file using local git command
            diffFile = await this.generateDiffFile();
            const diffContent = await readFile(diffFile, "utf-8");

            if (diffContent.trim().length === 0) {
                this.context.logger.info("No changes detected in generated SDK");
                return null;
            }

            // Extract previous version and clean diff
            // Note: this.version is the mapped magic version (e.g., "v505.503.4455" for Go)
            if (!this.version) {
                throw new Error("Version is required for auto versioning");
            }

            const previousVersion = autoVersioningService.extractPreviousVersion(diffContent, this.version);
            const cleanedDiff = autoVersioningService.cleanDiffForAI(diffContent, this.version);

            this.context.logger.debug(`Generated diff size: ${diffContent.length} bytes`);
            this.context.logger.debug(`Cleaned diff size: ${cleanedDiff.length} bytes`);
            this.context.logger.debug(`Previous version detected: ${previousVersion}`);

            // Call AI to analyze the diff
            try {
                // TODO: Need to get project for BAML client configuration
                const clientRegistry = await this.getClientRegistry();
                const bamlClient = BamlClient.withOptions({ clientRegistry });

                const analysis = await bamlClient.AnalyzeSdkDiff({
                    diff: cleanedDiff
                });

                if (analysis.version_bump === VersionBump.NO_CHANGE) {
                    this.context.logger.info("AI detected no semantic changes");
                    return null;
                }

                // Calculate new version
                const newVersion = this.incrementVersion(previousVersion, analysis.version_bump);

                this.context.logger.info(`Version bump: ${analysis.version_bump}, new version: ${newVersion}`);

                return {
                    version: newVersion,
                    commitMessage: analysis.message
                };
            } catch (aiError) {
                this.context.logger.info(`AI analysis failed, falling back to PATCH increment: ${aiError}`);
                const newVersion = this.incrementVersion(previousVersion, VersionBump.PATCH);
                return {
                    version: newVersion,
                    commitMessage: "SDK regeneration\n\nUnable to analyze changes with AI, incrementing PATCH version."
                };
            }
        } catch (error) {
            if (error instanceof AutoVersioningException) {
                // When user explicitly requested AUTO versioning, we must fail if we can't extract version
                this.context.logger.error(`AUTO versioning failed: ${error.message}`);
                throw new Error(
                    `Failed to extract previous version for automatic semantic versioning. ` +
                        `Please ensure your project has a version file in a supported format. Error: ${error.message}`
                );
            }

            this.context.logger.error(`Failed to perform automatic versioning: ${error}`);
            throw new Error(`Automatic versioning failed: ${error}`);
        } finally {
            // Clean up temp diff file
            if (diffFile) {
                try {
                    await rm(diffFile);
                } catch (cleanupError) {
                    this.context.logger.warn(`Failed to delete temp diff file: ${diffFile}`, String(cleanupError));
                }
            }
        }
    }

    /**
     * Increments a semantic version string based on the version bump type.
     * Uses the semver library for robust version handling.
     */
    private incrementVersion(version: string, versionBump: VersionBump): string {
        // Handle 'v' prefix - semver handles this automatically
        const cleanVersion = semver.clean(version);
        if (!cleanVersion) {
            throw new Error(`Invalid version format: ${version}`);
        }

        let releaseType: semver.ReleaseType;
        switch (versionBump) {
            case VersionBump.MAJOR:
                releaseType = "major";
                break;
            case VersionBump.MINOR:
                releaseType = "minor";
                break;
            case VersionBump.PATCH:
                releaseType = "patch";
                break;
            default:
                throw new Error(`Unsupported version bump: ${versionBump}`);
        }

        const newVersion = semver.inc(cleanVersion, releaseType);
        if (!newVersion) {
            throw new Error(`Failed to increment version: ${version}`);
        }

        // Preserve 'v' prefix if original version had it
        return version.startsWith("v") ? `v${newVersion}` : newVersion;
    }

    /**
     * Gets the BAML client registry for AI analysis.
     * This method is adapted from sdkDiffCommand.ts but needs project configuration.
     */
    private async getClientRegistry(): Promise<ClientRegistry> {
        if (this.ai == null) {
            throw new Error(
                "No AI service configuration found in generators.yml. " +
                    "Please add an 'ai' section with provider and model."
            );
        }

        this.context.logger.debug(`Using AI service: ${this.ai.provider} with model ${this.ai.model}`);
        return configureBamlClient(this.ai);
    }

    private async isFernIgnorePresent(): Promise<boolean> {
        const absolutePathToFernignore = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
        );
        return await doesPathExist(absolutePathToFernignore);
    }

    private async isGitRepository(): Promise<boolean> {
        const absolutePathToGitDir = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(".git"))
        );
        return await doesPathExist(absolutePathToGitDir);
    }

    private async copyGeneratedFilesWithFernIgnoreInExistingRepo(): Promise<void> {
        // Read all .fernignore paths
        const absolutePathToFernignore = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
        );
        const fernIgnorePaths = await getFernIgnorePaths({ absolutePathToFernignore });

        const response = await this.runGitCommand(["config", "--list"], this.absolutePathToLocalOutput);
        if (!response.includes("user.name")) {
            await this.runGitCommand(["config", "user.name", "fern-api"], this.absolutePathToLocalOutput);
            await this.runGitCommand(
                ["config", "user.email", "info@buildwithfern.com"],
                this.absolutePathToLocalOutput
            );
        }

        // Stage deletions `git rm -rf .`
        await this.runGitCommand(["rm", "-rf", "."], this.absolutePathToLocalOutput);

        // Copy all files from generated temp dir
        await this.copyGeneratedFilesToDirectory(this.absolutePathToLocalOutput);

        // If absolutePathToLocalOutput is already a git repository, work directly in it
        await this.runGitCommand(["add", "."], this.absolutePathToLocalOutput);

        // Undo changes to fernignore paths
        await this.runGitCommand(["reset", "--", ...fernIgnorePaths], this.absolutePathToLocalOutput);
        await this.runGitCommand(["restore", "."], this.absolutePathToLocalOutput);
    }

    private async copyGeneratedFilesWithFernIgnoreInTempRepo(): Promise<void> {
        // Create temp directory to resolve .fernignore
        const tmpOutputResolutionDir = AbsoluteFilePath.of((await tmp.dir({})).path);

        // Read all .fernignore paths
        const absolutePathToFernignore = AbsoluteFilePath.of(
            join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
        );
        const fernIgnorePaths = await getFernIgnorePaths({ absolutePathToFernignore });

        // Copy files from local output to tmp directory
        await cp(this.absolutePathToLocalOutput, tmpOutputResolutionDir, { recursive: true });

        // In tmp directory initialize a `.git` directory
        await this.runGitCommand(["init"], tmpOutputResolutionDir);
        await this.runGitCommand(["add", "."], tmpOutputResolutionDir);

        const response = await this.runGitCommand(["config", "--list"], tmpOutputResolutionDir);
        if (!response.includes("user.name")) {
            await this.runGitCommand(["config", "user.name", "fern-api"], tmpOutputResolutionDir);
            await this.runGitCommand(["config", "user.email", "info@buildwithfern.com"], tmpOutputResolutionDir);
        }
        await this.runGitCommand(["commit", "--allow-empty", "-m", '"init"'], tmpOutputResolutionDir);

        // Stage deletions `git rm -rf .`
        await this.runGitCommand(["rm", "-rf", "."], tmpOutputResolutionDir);

        // Copy all files from generated temp dir
        await this.copyGeneratedFilesToDirectory(tmpOutputResolutionDir);

        await this.runGitCommand(["add", "."], tmpOutputResolutionDir);

        // Undo changes to fernignore paths
        await this.runGitCommand(["reset", "--", ...fernIgnorePaths], tmpOutputResolutionDir);

        await this.runGitCommand(["restore", "."], tmpOutputResolutionDir);

        // remove .git dir before copying files over
        await rm(join(tmpOutputResolutionDir, RelativeFilePath.of(".git")), { recursive: true });

        // Delete local output directory and copy all files from the generated directory
        await rm(this.absolutePathToLocalOutput, { recursive: true });
        await cp(tmpOutputResolutionDir, this.absolutePathToLocalOutput, { recursive: true });
    }

    private async copyGeneratedFilesNoFernIgnorePreservingGit(): Promise<void> {
        // If absolutePathToLocalOutput is a git repository, preserve the .git folder

        // Read directory contents
        const contents = await readdir(this.absolutePathToLocalOutput);

        // Delete everything except .git
        await Promise.all(
            contents
                .filter((item) => item !== ".git")
                .map((item) =>
                    rm(join(this.absolutePathToLocalOutput, RelativeFilePath.of(item)), {
                        force: true,
                        recursive: true
                    })
                )
        );

        // Copy generated files
        await this.copyGeneratedFilesToDirectory(this.absolutePathToLocalOutput);
    }

    private async copyGeneratedFilesNoFernIgnoreDeleteAll(): Promise<void> {
        this.context.logger.debug(`rm -rf ${this.absolutePathToLocalOutput}`);
        await rm(this.absolutePathToLocalOutput, { force: true, recursive: true });
        await this.copyGeneratedFilesToDirectory(this.absolutePathToLocalOutput);
    }

    private async copyGeneratedFilesToDirectory(outputPath: AbsoluteFilePath): Promise<void> {
        const [firstLocalOutputItem, ...remaininglocalOutputItems] = await readdir(
            this.absolutePathToTmpOutputDirectory
        );
        if (firstLocalOutputItem == null) {
            return;
        }
        this.context.logger.debug(`Copying generated files to ${outputPath}`);
        if (firstLocalOutputItem.endsWith(".zip")) {
            await decompress(
                join(this.absolutePathToTmpOutputDirectory, RelativeFilePath.of(firstLocalOutputItem)),
                outputPath
            );
            for (const localOutputItem of remaininglocalOutputItems) {
                await cp(
                    join(this.absolutePathToTmpOutputDirectory, RelativeFilePath.of(localOutputItem)),
                    join(outputPath, RelativeFilePath.of(localOutputItem)),
                    { recursive: true }
                );
            }
        } else {
            await cp(this.absolutePathToTmpOutputDirectory, outputPath, { recursive: true });
        }
    }

    private async copySnippetJSON({
        absolutePathToTmpSnippetJSON,
        absolutePathToLocalSnippetJSON
    }: {
        absolutePathToTmpSnippetJSON: AbsoluteFilePath;
        absolutePathToLocalSnippetJSON: AbsoluteFilePath;
    }): Promise<void> {
        this.context.logger.debug(`Copying generated snippets to ${absolutePathToLocalSnippetJSON}`);
        await cp(absolutePathToTmpSnippetJSON, absolutePathToLocalSnippetJSON);
    }

    private async runGitCommand(options: string[], cwd: AbsoluteFilePath): Promise<string> {
        const response = await loggingExeca(this.context.logger, "git", options, {
            cwd,
            doNotPipeOutput: true
        });
        return response.stdout;
    }

    /**
     * Generates a git diff file for automatic versioning analysis.
     * This compares the current state against HEAD to see what changes have been made.
     */
    private async generateDiffFile(): Promise<string> {
        const diffFile = pathJoin(tmpdir(), `git-diff-${Date.now()}.patch`);

        await this.runGitCommand(["diff", "HEAD", "--output", diffFile], this.absolutePathToLocalOutput);

        this.context.logger.info(`Generated git diff to file: ${diffFile}`);
        return diffFile;
    }
}

const NEW_LINE_REGEX = /\r?\n/;

async function getFernIgnorePaths({
    absolutePathToFernignore
}: {
    absolutePathToFernignore: AbsoluteFilePath;
}): Promise<string[]> {
    const fernIgnoreFileContents = (await readFile(absolutePathToFernignore)).toString();
    return [
        FERNIGNORE_FILENAME,
        ...fernIgnoreFileContents
            .trim()
            .split(NEW_LINE_REGEX)
            .map((line) => {
                // Remove comments at the end of the line
                const commentIndex = line.indexOf("#");
                if (commentIndex !== -1) {
                    return line.slice(0, commentIndex).trim();
                }
                return line.trim();
            })
            .filter((line) => line.length > 0)
    ];
}
