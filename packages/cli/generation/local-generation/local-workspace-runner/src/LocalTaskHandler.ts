import { ClientRegistry } from "@boundaryml/baml";
import { b as BamlClient, configureBamlClient, VersionBump } from "@fern-api/cli-ai";
import { FERNIGNORE_FILENAME, generatorsYml, getFernIgnorePaths } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import decompress from "decompress";
import { cp, readdir, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import semver from "semver";
import tmp from "tmp-promise";
import { AutoVersioningCache, CachedAnalysis } from "./AutoVersioningCache.js";
import {
    AutoVersioningException,
    AutoVersioningService,
    AutoVersionResult,
    countFilesInDiff,
    formatSizeKB
} from "./AutoVersioningService.js";
import { sanitizeChangelogEntry } from "./sanitizeChangelogEntry.js";
import { isAutoVersion, MAX_AI_DIFF_BYTES, MAX_CHUNKS, MAX_RAW_DIFF_BYTES, maxVersionBump } from "./VersionUtils.js";

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
        ai: generatorsYml.AiServicesSchema | undefined;
        isWhitelabel: boolean;
        autoVersioningCache?: AutoVersioningCache;
        generatorLanguage: string | undefined;
        absolutePathToSpecRepo: AbsoluteFilePath | undefined;
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
    private ai: generatorsYml.AiServicesSchema | undefined;
    private isWhitelabel: boolean;
    private autoVersioningCache: AutoVersioningCache | undefined;
    private generatorLanguage: string | undefined;
    private absolutePathToSpecRepo: AbsoluteFilePath | undefined;

    constructor({
        context,
        absolutePathToTmpOutputDirectory,
        absolutePathToTmpSnippetJSON,
        absolutePathToLocalSnippetTemplateJSON,
        absolutePathToLocalOutput,
        absolutePathToLocalSnippetJSON,
        absolutePathToTmpSnippetTemplatesJSON,
        version,
        ai,
        isWhitelabel,
        autoVersioningCache,
        generatorLanguage,
        absolutePathToSpecRepo
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
        this.isWhitelabel = isWhitelabel;
        this.autoVersioningCache = autoVersioningCache;
        this.generatorLanguage = generatorLanguage;
        this.absolutePathToSpecRepo = absolutePathToSpecRepo;
    }

    public async copyGeneratedFiles(): Promise<{
        shouldCommit: boolean;
        autoVersioningCommitMessage?: string;
        autoVersioningChangelogEntry?: string;
        autoVersioningPrDescription?: string;
        autoVersioningVersionBumpReason?: string;
    }> {
        const isFernIgnorePresent = await this.isFernIgnorePresent();
        const isExistingGitRepo = await this.isGitRepository();

        // Read prior changelog BEFORE copy operations overwrite the output directory
        const priorChangelog =
            this.version != null && isAutoVersion(this.version) ? await this.readPriorChangelog(3) : "";

        if (isFernIgnorePresent) {
            const absolutePathToFernignore = AbsoluteFilePath.of(
                join(this.absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME))
            );
            const fernIgnorePaths = await getFernIgnorePaths({ absolutePathToFernignore });
            const userPaths = fernIgnorePaths.filter((p) => p !== FERNIGNORE_FILENAME);
            this.context.logger.debug(
                `Detected ${FERNIGNORE_FILENAME} at ${absolutePathToFernignore} — preserving ${userPaths.length} path(s): ${userPaths.join(", ")}`
            );
        }

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
            const autoVersionResult = await this.handleAutoVersioning(priorChangelog);
            if (autoVersionResult == null) {
                this.context.logger.info("No semantic changes detected. Skipping GitHub operations.");
                return {
                    shouldCommit: false,
                    autoVersioningCommitMessage: undefined,
                    autoVersioningChangelogEntry: undefined,
                    autoVersioningPrDescription: undefined,
                    autoVersioningVersionBumpReason: undefined
                };
            }
            // Replace placeholder version with computed version
            await autoVersioningService.replaceMagicVersion(
                this.absolutePathToLocalOutput,
                this.version,
                autoVersionResult.version
            );
            return {
                shouldCommit: true,
                autoVersioningCommitMessage: autoVersionResult.commitMessage,
                autoVersioningChangelogEntry: autoVersionResult.changelogEntry,
                autoVersioningPrDescription: autoVersionResult.prDescription,
                autoVersioningVersionBumpReason: autoVersionResult.versionBumpReason
            };
        }
        return { shouldCommit: true, autoVersioningCommitMessage: undefined };
    }

    /**
     * Handles automatic semantic versioning by analyzing the git diff with AI.
     * Returns the final version to use and the commit message, or null if NO_CHANGE.
     */
    private async handleAutoVersioning(priorChangelog: string): Promise<AutoVersionResult | null> {
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

            const rawDiffSizeKB = formatSizeKB(diffContent.length);
            const cleanedDiffSizeKB = formatSizeKB(cleanedDiff.length);
            const rawFileCount = countFilesInDiff(diffContent);
            const cleanedFileCount = countFilesInDiff(cleanedDiff);

            this.context.logger.debug(
                `Generated diff size: ${rawDiffSizeKB}KB (${diffContent.length} chars), ${rawFileCount} files changed. ` +
                    `Cleaned diff size: ${cleanedDiffSizeKB}KB (${cleanedDiff.length} chars), ${cleanedFileCount} files remaining`
            );

            // Handle new SDK repository with no previous version
            if (previousVersion == null) {
                this.context.logger.info(
                    "No previous version found (new SDK repository). Using 0.0.1 as initial version."
                );
                const initialVersion = this.version?.startsWith("v") ? "v0.0.1" : "0.0.1";
                const commitMessage = this.isWhitelabel
                    ? "Initial SDK generation"
                    : "Initial SDK generation\n\n🌿 Generated with Fern";
                return {
                    version: initialVersion,
                    commitMessage
                };
            }

            this.context.logger.debug(`Previous version detected: ${previousVersion}`);

            if (cleanedDiff.trim().length === 0) {
                this.context.logger.info(
                    "No actual changes detected after filtering version-only changes. Cancelling generation."
                );
                return null;
            }

            // Read spec repo commit message for AI context
            const specCommitMessage = await this.readSpecCommitMessage();
            if (specCommitMessage) {
                this.context.logger.debug(`Spec repo commit message: ${specCommitMessage}`);
            }

            // Reject absurdly large diffs before chunking to prevent excessive resource usage
            const cleanedDiffBytes = Buffer.byteLength(cleanedDiff, "utf-8");
            if (cleanedDiffBytes > MAX_RAW_DIFF_BYTES) {
                this.context.logger.warn(
                    `Diff too large for analysis (${(cleanedDiffBytes / 1_000_000).toFixed(1)}MB, ` +
                        `limit ${MAX_RAW_DIFF_BYTES / 1_000_000}MB). Falling back to PATCH increment.`
                );
                const newVersion = this.incrementVersion(previousVersion, VersionBump.PATCH);
                const fallbackMessage = this.isWhitelabel
                    ? "SDK regeneration"
                    : "SDK regeneration\n\n🌿 Generated with Fern";
                return {
                    version: newVersion,
                    commitMessage: fallbackMessage
                };
            }

            // Split diff into chunks and analyze each one with the AI
            const chunks = autoVersioningService.chunkDiff(cleanedDiff, MAX_AI_DIFF_BYTES);

            // Cap at MAX_CHUNKS to bound latency/cost for very large diffs.
            // Chunks are ranked by semantic priority, so skipped chunks are
            // low-priority (addition-only) sections.
            const cappedChunks = chunks.slice(0, MAX_CHUNKS);
            const skippedChunks = chunks.length - cappedChunks.length;

            if (chunks.length > 1) {
                this.context.logger.info(
                    `Diff too large for single AI call (${cleanedDiffBytes} bytes). ` +
                        `Split into ${chunks.length} chunks for analysis` +
                        (skippedChunks > 0
                            ? ` (capped at ${MAX_CHUNKS}, skipping ${skippedChunks} low-priority chunks).`
                            : ".")
                );
            }

            let analysis: CachedAnalysis | null;
            try {
                if (cappedChunks.length <= 1) {
                    // Single chunk (or small diff): use normal path with caching
                    analysis = await this.getAnalysis(
                        cleanedDiff,
                        this.generatorLanguage ?? "unknown",
                        previousVersion ?? "0.0.0",
                        priorChangelog,
                        specCommitMessage
                    );
                } else {
                    // Multiple chunks: analyze each sequentially, merge results.
                    // Sequential (not parallel) to avoid burst API cost and simplify
                    // error handling. Worst case: 40 chunks × ~3s = ~2 min.
                    // We process ALL chunks so that every changelog entry is captured.
                    let bestBump: string = VersionBump.NO_CHANGE;
                    let bestMessage = "";
                    let bestVersionBumpReason: string | undefined;
                    const allChangelogEntries: string[] = [];

                    for (let i = 0; i < cappedChunks.length; i++) {
                        const chunk = cappedChunks[i];
                        if (chunk == null) {
                            continue;
                        }
                        this.context.logger.debug(
                            `Analyzing chunk ${i + 1}/${cappedChunks.length} ` +
                                `(${Buffer.byteLength(chunk, "utf-8")} bytes)`
                        );

                        const chunkAnalysis = await this.getAnalysis(
                            chunk,
                            this.generatorLanguage ?? "unknown",
                            previousVersion ?? "0.0.0",
                            priorChangelog,
                            specCommitMessage
                        );

                        if (chunkAnalysis == null) {
                            this.context.logger.debug(`Chunk ${i + 1} result: NO_CHANGE`);
                            continue;
                        }

                        const prevBest = bestBump;
                        bestBump = maxVersionBump(bestBump, chunkAnalysis.versionBump);

                        // Keep the commit message and bump reason from the chunk that produced the highest bump
                        if (bestBump !== prevBest) {
                            bestMessage = chunkAnalysis.message;
                            bestVersionBumpReason = chunkAnalysis.versionBumpReason;
                        }

                        // Collect all non-empty changelog entries so the final
                        // changelog reflects changes from every chunk.
                        const entry = chunkAnalysis.changelogEntry?.trim();
                        if (entry) {
                            allChangelogEntries.push(entry);
                        }

                        this.context.logger.debug(
                            `Chunk ${i + 1} result: ${chunkAnalysis.versionBump}` +
                                (bestBump !== prevBest ? ` (new highest: ${bestBump})` : "")
                        );
                    }

                    if (bestBump === VersionBump.NO_CHANGE) {
                        analysis = null;
                    } else {
                        let changelogEntry: string;
                        let prDescription: string | undefined;
                        let versionBumpReason: string | undefined = bestVersionBumpReason;
                        if (allChangelogEntries.length > 1) {
                            // Consolidate repetitive multi-chunk entries via AI rollup
                            const rawEntries = allChangelogEntries
                                .map((e) => (e.startsWith("- ") ? e : `- ${e}`))
                                .join("\n");
                            try {
                                this.context.logger.debug(
                                    `Consolidating ${allChangelogEntries.length} changelog entries via AI rollup`
                                );
                                const rollup = await BamlClient.withOptions({
                                    clientRegistry: await this.getClientRegistry()
                                }).ConsolidateChangelog(rawEntries, bestBump, this.generatorLanguage ?? "unknown");
                                changelogEntry = rollup.consolidated_changelog?.trim() || rawEntries;
                                prDescription = rollup.pr_description?.trim() || undefined;
                                versionBumpReason = rollup.version_bump_reason?.trim() || undefined;
                            } catch (rollupError) {
                                this.context.logger.warn(
                                    `Changelog consolidation failed, using raw entries: ${rollupError instanceof Error ? rollupError.message : String(rollupError)}`
                                );
                                changelogEntry = rawEntries;
                            }
                        } else {
                            changelogEntry = allChangelogEntries[0] ?? "";
                            versionBumpReason = bestVersionBumpReason;
                        }

                        analysis = {
                            versionBump: bestBump as VersionBump,
                            message: bestMessage,
                            changelogEntry,
                            prDescription,
                            versionBumpReason
                        };
                    }
                }
            } catch (aiError) {
                const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
                this.context.logger.warn(
                    `AI analysis failed, falling back to PATCH increment. ` +
                        `Diff stats: ${cleanedDiff.length.toLocaleString()} chars cleaned ` +
                        `(${cleanedDiffSizeKB}KB cleaned, ${rawDiffSizeKB}KB raw), ${cleanedFileCount} files remaining. ` +
                        (cappedChunks.length > 1
                            ? `The diff was split into ${cappedChunks.length} chunks but analysis still failed. `
                            : "") +
                        `Error: ${errorMessage}`
                );
                const newVersion = this.incrementVersion(previousVersion, VersionBump.PATCH);
                const fallbackMessage = this.isWhitelabel
                    ? "SDK regeneration"
                    : "SDK regeneration\n\n🌿 Generated with Fern";
                return {
                    version: newVersion,
                    commitMessage: fallbackMessage
                };
            }

            // Each generator applies its own previousVersion and branding
            if (analysis == null) {
                this.context.logger.info("AI detected no semantic changes");
                return null;
            }

            const finalBump = analysis.versionBump;
            const finalMessage = analysis.message;
            const finalChangelogEntry = analysis.changelogEntry;
            const finalPrDescription = analysis.prDescription;
            const finalVersionBumpReason = analysis.versionBumpReason;

            const newVersion = this.incrementVersion(previousVersion, finalBump);
            this.context.logger.info(`Version bump: ${finalBump}, new version: ${newVersion}`);

            const commitMessage = this.isWhitelabel ? finalMessage : this.addFernBranding(finalMessage);

            // changelogEntry is populated for MINOR/MAJOR, undefined for PATCH (empty string from AI)
            const changelogEntry = finalChangelogEntry?.trim()
                ? sanitizeChangelogEntry(finalChangelogEntry.trim())
                : undefined;
            const prDescription = finalPrDescription?.trim() || undefined;
            const versionBumpReason = finalVersionBumpReason?.trim() || undefined;

            return {
                version: newVersion,
                commitMessage,
                changelogEntry,
                prDescription,
                versionBumpReason
            };
        } catch (error) {
            if (error instanceof AutoVersioningException) {
                // Fall back to initial version when we can't extract the previous version
                // (e.g., new SDK repos where all files are additions, or unsupported version formats)
                this.context.logger.warn(
                    `AUTO versioning could not extract previous version: ${error.message}. ` +
                        `Falling back to initial version 0.0.1.`
                );
                const initialVersion = this.version?.startsWith("v") ? "v0.0.1" : "0.0.1";
                const commitMessage = this.isWhitelabel
                    ? "Initial SDK generation"
                    : "Initial SDK generation\n\n🌿 Generated with Fern";
                return {
                    version: initialVersion,
                    commitMessage
                };
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
     * Returns the raw AI analysis for the given cleaned diff, using the cache
     * (with Promise coalescing) when available. Each concurrent generator with
     * the same diff awaits the same in-flight AI call.
     *
     * On AI failure the method throws so that each generator can apply its own
     * fallback logic (e.g. PATCH bump with generator-specific previousVersion).
     */
    private async getAnalysis(
        cleanedDiff: string,
        language: string,
        previousVersion: string,
        priorChangelog: string = "",
        specCommitMessage: string = ""
    ): Promise<CachedAnalysis | null> {
        const doAnalysis = async (): Promise<CachedAnalysis | null> => {
            const clientRegistry = await this.getClientRegistry();
            const bamlClient = BamlClient.withOptions({ clientRegistry });
            const analysis = await bamlClient.AnalyzeSdkDiff(
                cleanedDiff,
                language,
                previousVersion,
                priorChangelog,
                specCommitMessage
            );

            if (analysis.version_bump === VersionBump.NO_CHANGE) {
                return null;
            }
            return {
                versionBump: analysis.version_bump,
                message: analysis.message,
                changelogEntry: analysis.changelog_entry,
                versionBumpReason: analysis.version_bump_reason
            };
        };

        if (this.autoVersioningCache == null) {
            return doAnalysis();
        }

        const cacheKey = this.autoVersioningCache.key(
            cleanedDiff,
            language,
            previousVersion,
            priorChangelog,
            specCommitMessage
        );
        const { promise, isHit } = this.autoVersioningCache.getOrCompute(cacheKey, doAnalysis);

        if (isHit) {
            const cached = await promise;
            this.context.logger.info(
                `[AutoVersioning] Cache hit — reusing result (key: ${cacheKey.slice(0, 8)}…) ` +
                    `bump=${cached?.versionBump ?? "NO_CHANGE"}`
            );
            return cached;
        }

        return promise;
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

    private addFernBranding(message: string): string {
        const trimmed = message.trim();
        return `${trimmed}\n\n🌿 Generated with Fern`;
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

        // Also preserve README.md if the generated output doesn't include one,
        // to prevent accidental deletion when README generation fails silently.
        const pathsToPreserve = await this.getPathsToPreserve(fernIgnorePaths);

        // Stage deletions `git rm -rf .`
        await this.runGitCommand(["rm", "-rf", "."], this.absolutePathToLocalOutput);

        // Copy all files from generated temp dir
        await this.copyGeneratedFilesToDirectory(this.absolutePathToLocalOutput);

        // If absolutePathToLocalOutput is already a git repository, work directly in it
        await this.runGitCommand(["add", "."], this.absolutePathToLocalOutput);

        // Undo changes to preserved paths (fernignore + README.md if missing from output)
        await this.runGitCommand(["reset", "--", ...pathsToPreserve], this.absolutePathToLocalOutput);
        await this.runGitCommand(["clean", "-fd", "--", ...pathsToPreserve], this.absolutePathToLocalOutput);
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

        // Also preserve README.md if the generated output doesn't include one.
        const pathsToPreserve = await this.getPathsToPreserve(fernIgnorePaths);

        // Copy files from local output to tmp directory
        await cp(this.absolutePathToLocalOutput, tmpOutputResolutionDir, { recursive: true });

        // Initialize a throwaway git repo in the temp directory. This is only used to
        // leverage git's file-tracking for resolving .fernignore paths. We inline the
        // user config, disable commit signing, and skip hooks to avoid prompts (e.g.
        // Touch ID on macOS) and unnecessary overhead.
        await this.runGitCommand(["init"], tmpOutputResolutionDir);
        await this.runGitCommand(["add", "."], tmpOutputResolutionDir);
        await this.runGitCommand(
            [
                "-c",
                "user.name=fern",
                "-c",
                "user.email=hey@buildwithfern.com",
                "-c",
                "commit.gpgsign=false",
                "commit",
                "--allow-empty",
                "--no-verify",
                "-m",
                "init"
            ],
            tmpOutputResolutionDir
        );

        // Stage deletions `git rm -rf .`
        await this.runGitCommand(["rm", "-rf", "."], tmpOutputResolutionDir);

        // Copy all files from generated temp dir
        await this.copyGeneratedFilesToDirectory(tmpOutputResolutionDir);

        await this.runGitCommand(["add", "."], tmpOutputResolutionDir);

        // Undo changes to preserved paths (fernignore + README.md if missing from output)
        await this.runGitCommand(["reset", "--", ...pathsToPreserve], tmpOutputResolutionDir);
        await this.runGitCommand(["clean", "-fd", "--", ...pathsToPreserve], tmpOutputResolutionDir);
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

        // Build list of items to preserve: always .git, plus README.md if not in generated output
        const itemsToPreserve = [".git"];
        if (await this.generatedOutputMissingReadme()) {
            itemsToPreserve.push("README.md");
        }

        // Delete everything except preserved items
        await Promise.all(
            contents
                .filter((item) => !itemsToPreserve.includes(item))
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

    /**
     * Checks whether the generated output is missing README.md.
     * When true, the existing README.md should be preserved to prevent
     * accidental deletion caused by silent README generation failures.
     */
    private async generatedOutputMissingReadme(): Promise<boolean> {
        try {
            const contents = await readdir(this.absolutePathToTmpOutputDirectory);
            // If the output is a single zip file we can't inspect its contents,
            // so conservatively assume it includes a README.
            if (contents.length === 1 && contents[0] != null && contents[0].endsWith(".zip")) {
                return false;
            }
            return !contents.includes("README.md");
        } catch {
            // If we can't check the generated output, preserve the existing README to be safe
            return true;
        }
    }

    /**
     * Returns the list of paths that should be preserved during file copy.
     * Starts with fernignore paths, and adds README.md if the generated
     * output does not include one.
     */
    private async getPathsToPreserve(fernIgnorePaths: string[]): Promise<string[]> {
        if (await this.generatedOutputMissingReadme()) {
            return [...fernIgnorePaths, "README.md"];
        }
        return fernIgnorePaths;
    }

    private async runGitCommand(options: string[], cwd: AbsoluteFilePath): Promise<string> {
        const response = await loggingExeca(this.context.logger, "git", options, {
            cwd,
            doNotPipeOutput: true
        });
        return response.stdout;
    }

    /**
     * Reads prior changelog entries from the SDK output directory.
     * Looks for CHANGELOG.md (case-insensitive), extracts the last `maxEntries`
     * entries (each starting with a `## ` header), and returns them as a string.
     * Returns empty string if not found or on any error. Truncates to 2KB.
     */
    public async readPriorChangelog(maxEntries: number): Promise<string> {
        const MAX_CHANGELOG_SIZE = 2048; // 2KB

        try {
            // Find CHANGELOG.md case-insensitively
            const files = await readdir(this.absolutePathToLocalOutput);
            const changelogFile = files.find((f) => f.toLowerCase() === "changelog.md");
            if (!changelogFile) {
                return "";
            }

            const changelogPath = join(this.absolutePathToLocalOutput, RelativeFilePath.of(changelogFile));
            const content = await readFile(changelogPath, "utf-8");
            if (content.trim().length === 0) {
                return "";
            }

            // Parse entries: each entry starts with a `## ` header
            const lines = content.split("\n");
            const entryStartIndices: number[] = [];
            for (let i = 0; i < lines.length; i++) {
                if (lines[i]?.startsWith("## ")) {
                    entryStartIndices.push(i);
                }
            }

            if (entryStartIndices.length === 0) {
                return "";
            }

            // Take the first maxEntries entries (most recent are at the top in standard changelogs)
            const firstLineIndex = entryStartIndices[0];
            if (firstLineIndex == null) {
                return "";
            }
            const endEntryIndex = entryStartIndices[Math.min(maxEntries, entryStartIndices.length)];
            const endLineIndex = endEntryIndex != null ? endEntryIndex : lines.length;
            const extracted = lines.slice(firstLineIndex, endLineIndex).join("\n").trim();

            // Truncate to 2KB if needed
            if (extracted.length > MAX_CHANGELOG_SIZE) {
                return extracted.substring(0, MAX_CHANGELOG_SIZE);
            }

            return extracted;
        } catch (error) {
            this.context.logger.debug(`Failed to read prior changelog: ${error}`);
            return "";
        }
    }

    /**
     * Reads the most recent git commit message that touched the .fern/ directory
     * in the spec repo. This provides context to the AI about why the API changed.
     */
    public async readSpecCommitMessage(): Promise<string> {
        if (this.absolutePathToSpecRepo == null) {
            return "";
        }
        try {
            // Find the git repo root so we can look for commits touching .fern/
            // regardless of where the workspace directory is nested
            const repoRootResult = await loggingExeca(this.context.logger, "git", ["rev-parse", "--show-toplevel"], {
                cwd: this.absolutePathToSpecRepo,
                doNotPipeOutput: true
            });
            const repoRoot = repoRootResult.stdout.trim();
            if (!repoRoot) {
                return "";
            }

            const result = await loggingExeca(
                this.context.logger,
                "git",
                ["log", "-1", "--format=%B", "--", ".fern/"],
                { cwd: repoRoot, doNotPipeOutput: true }
            );
            const message = result.stdout.trim();
            // Filter out unhelpful messages
            if (!message || message.toLowerCase().startsWith("merge ") || message.length < 5) {
                return "";
            }
            // Truncate to 500 chars to avoid bloating the prompt
            return message.length > 500 ? message.slice(0, 500) + "\u2026" : message;
        } catch (error) {
            this.context.logger.debug(`Failed to read spec repo commit message: ${error}`);
            return "";
        }
    }

    /**
     * Generates a git diff file for automatic versioning analysis.
     * This compares the current state against HEAD to see what changes have been made.
     *
     * Uses `git add -N .` (intent-to-add) before diffing so that newly created files
     * (e.g. from a namespace rename) appear in the diff. Without this, `git diff HEAD`
     * silently ignores untracked files, which causes namespace changes to be invisible
     * when the copy path does not stage files (copyGeneratedFilesNoFernIgnorePreservingGit).
     */
    private async generateDiffFile(): Promise<string> {
        const diffFile = pathJoin(tmpdir(), `git-diff-${Date.now()}.patch`);

        // Mark any new untracked files as intent-to-add so they appear in the diff.
        // This is a no-op for files that are already staged.
        await this.runGitCommand(["add", "-N", "."], this.absolutePathToLocalOutput);

        await this.runGitCommand(
            ["diff", "HEAD", "--output", diffFile, "--", ".", ":(exclude).fern/metadata.json"],
            this.absolutePathToLocalOutput
        );

        this.context.logger.info(`Generated git diff to file: ${diffFile}`);
        return diffFile;
    }
}
