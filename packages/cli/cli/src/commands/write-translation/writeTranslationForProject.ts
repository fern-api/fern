import { docsYml } from "@fern-api/configuration";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import cliProgress from "cli-progress";
import { existsSync } from "fs";
import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import IS_CI from "is-ci";
import path from "path";

import { CliContext } from "../../cli-context/CliContext";
import { isAssetFile, shouldProcessFile, transformContentForLanguage } from "./content-transformer";
import { createLanguageSpecificDocsConfig } from "./docs-config-utils";
import { collectFiles } from "./file-collection-utils";
import {
    cleanupHashMappings,
    hasFileChanged,
    loadHashMappings,
    saveHashMappings,
    updateAndSaveHashForFile
} from "./hash-utils";
import { ContentTransformation, ProcessingStats } from "./types";

type Language = docsYml.RawSchemas.Language;

export async function writeTranslationForProject({
    project,
    cliContext,
    stub = false
}: {
    project: Project;
    cliContext: CliContext;
    stub?: boolean;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.logger.error("No docs workspace found. Please ensure you have a docs.yml file configured.");
        return;
    }

    const languages = docsWorkspace.config.languages;
    if (languages == null || languages.length === 0) {
        cliContext.logger.error(
            "No languages found in docs.yml configuration. Please add a 'languages' field with the desired languages."
        );
        return;
    }

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        const fernDirectory = docsWorkspace.absoluteFilePath;
        const translationsDirectory = join(fernDirectory, RelativeFilePath.of("translations"));

        const sourceLanguage = languages[0];
        if (!sourceLanguage) {
            throw new Error("Unexpected error - first element of languages array is invalid");
        }

        if (!existsSync(translationsDirectory)) {
            context.logger.debug(`Creating translations directory at: ${translationsDirectory}`);
            await mkdir(translationsDirectory, { recursive: true });
        }

        const languageStats: Partial<Record<Language, ProcessingStats>> = {};
        const targetLanguages = languages.filter((lang) => lang !== sourceLanguage);

        const originalDocsConfigPath = join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
        const hasDocsConfig = existsSync(originalDocsConfigPath);

        for (const language of targetLanguages) {
            const languageDirectory = join(
                translationsDirectory,
                RelativeFilePath.of(language),
                RelativeFilePath.of("fern")
            );

            if (!existsSync(languageDirectory)) {
                await mkdir(languageDirectory, { recursive: true });
            }

            languageStats[language] = {
                filesProcessed: 0,
                filesSkipped: 0
            };
        }

        // Initialize stats for source language even though we won't create files for it
        languageStats[sourceLanguage] = {
            filesProcessed: 0,
            filesSkipped: 0
        };

        const aggregateStats: ProcessingStats = {
            filesProcessed: 0,
            filesSkipped: 0
        };

        try {
            let hashMappings = await loadHashMappings(translationsDirectory);

            const allFiles = await collectFiles(fernDirectory, "");
            const allFilesEntries = Object.entries(allFiles);

            // clean up hash mappings for files that no longer exist
            const existingFileSet = new Set(Object.values(allFiles));
            const cleanedHashMappings = cleanupHashMappings(hashMappings, existingFileSet);

            // Save cleaned hash mappings if any entries were removed
            if (Object.keys(cleanedHashMappings).length !== Object.keys(hashMappings).length) {
                await saveHashMappings(translationsDirectory, cleanedHashMappings);
            }
            hashMappings = cleanedHashMappings;

            const filesToProcess: Array<[string, RelativeFilePath]> = [];
            for (const [filePath, relativePath] of allFilesEntries) {
                if (hasDocsConfig && relativePath === DOCS_CONFIGURATION_FILENAME) {
                    continue;
                }

                if (shouldProcessFile(filePath, stub)) {
                    const fileHasChanged = await hasFileChanged(filePath, relativePath, hashMappings);
                    if (fileHasChanged) {
                        filesToProcess.push([filePath, relativePath]);
                    }
                }
            }

            // Check if docs config has changed to include it in progress calculation
            let docsConfigHasChanged = false;
            if (hasDocsConfig) {
                docsConfigHasChanged = await hasFileChanged(
                    originalDocsConfigPath,
                    RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
                    hashMappings
                );
            }

            const totalFilesToProcess = filesToProcess.length + (docsConfigHasChanged ? 1 : 0);
            // Include docs config in total count if it exists and has changed
            const totalProgressItems = totalFilesToProcess * targetLanguages.length;
            const useProgressBar = process.stdout.isTTY && !IS_CI && totalProgressItems > 0;

            let progressBar: cliProgress.SingleBar | undefined;
            if (useProgressBar) {
                progressBar = new cliProgress.SingleBar({
                    format: "Processing files [{bar}] {percentage}% | {value}/{total} files",
                    barCompleteChar: "\u2588",
                    barIncompleteChar: "\u2591",
                    hideCursor: true,
                    clearOnComplete: false,
                    stopOnComplete: true
                });
                progressBar.start(totalProgressItems, 0);
            }

            let processedFileIndex = 0;
            let changedFileIndex = 0;
            try {
                // Process docs config first if it exists and has changed
                if (hasDocsConfig) {
                    if (docsConfigHasChanged) {
                        // Create language-specific docs configs for all target languages
                        for (const language of targetLanguages) {
                            processedFileIndex++;
                            changedFileIndex++;
                            if (!useProgressBar) {
                                context.logger.info(
                                    chalk.gray(
                                        `[${changedFileIndex}/${totalFilesToProcess + 1}] Processing: ${DOCS_CONFIGURATION_FILENAME} (docs config) for language: ${language}`
                                    )
                                );
                            }
                            cliContext.logger.debug(
                                `[PROCESSING] ${DOCS_CONFIGURATION_FILENAME} (docs config) for language: ${language}`
                            );

                            const languageDirectory = join(
                                translationsDirectory,
                                RelativeFilePath.of(language),
                                RelativeFilePath.of("fern")
                            );

                            await createLanguageSpecificDocsConfig({
                                originalDocsConfigPath,
                                targetDirectory: languageDirectory,
                                language,
                                sourceLanguage,
                                context: cliContext,
                                stub
                            });

                            const languageStatsForLang = languageStats[language];
                            if (progressBar) {
                                progressBar.update(processedFileIndex);
                            }
                            if (languageStatsForLang) {
                                languageStatsForLang.filesProcessed++;
                            }
                            cliContext.logger.debug(
                                `[COMPLETED] ${DOCS_CONFIGURATION_FILENAME} -> ${language}/${DOCS_CONFIGURATION_FILENAME}`
                            );
                        }

                        // Update hash for source language tracking and save immediately
                        const originalConfigContent = await readFile(originalDocsConfigPath, "utf-8");
                        await updateAndSaveHashForFile(
                            translationsDirectory,
                            hashMappings,
                            RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME),
                            originalConfigContent
                        );
                        const sourceStats = languageStats[sourceLanguage];
                        if (sourceStats) {
                            sourceStats.filesProcessed++;
                        }
                        cliContext.logger.debug(
                            `[HASH UPDATED] ${DOCS_CONFIGURATION_FILENAME} -> ${sourceLanguage} (source language - hash updated)`
                        );
                    } else {
                        // Docs config hasn't changed, update skip counts
                        for (const language of languages) {
                            const stats = languageStats[language];
                            if (stats) {
                                stats.filesSkipped++;
                            }
                        }
                        cliContext.logger.debug(
                            `[SKIPPED] ${DOCS_CONFIGURATION_FILENAME} (no changes since last translation)`
                        );
                    }
                }

                for (const [filePath, relativePath] of allFilesEntries) {
                    if (hasDocsConfig && relativePath === DOCS_CONFIGURATION_FILENAME) {
                        cliContext.logger.debug(
                            `[SKIPPED] ${relativePath} (already handled by docs config processing)`
                        );
                        // Don't update hash here - it's already handled in the docs config processing
                        continue;
                    }

                    const fileHasChanged = await hasFileChanged(filePath, relativePath, hashMappings);

                    if (!fileHasChanged) {
                        for (const language of languages) {
                            const stats = languageStats[language];
                            if (stats) {
                                stats.filesSkipped++;
                            }
                        }
                        cliContext.logger.debug(`[SKIPPED] ${relativePath} (no changes since last translation)`);
                        continue;
                    }

                    cliContext.logger.debug(`[PROCESSING] ${relativePath} (detected changes)`);

                    const originalContent = await readFile(filePath, "utf-8");
                    await updateAndSaveHashForFile(translationsDirectory, hashMappings, relativePath, originalContent);

                    const sourceStats = languageStats[sourceLanguage];
                    if (sourceStats) {
                        sourceStats.filesProcessed++;
                    }
                    cliContext.logger.debug(
                        `[HASH UPDATED] ${relativePath} -> ${sourceLanguage} (source language - hash only)`
                    );

                    for (const language of targetLanguages) {
                        changedFileIndex++;
                        processedFileIndex++;
                        if (!useProgressBar) {
                            context.logger.info(
                                chalk.gray(`[${changedFileIndex}/${totalFilesToProcess}] Processing: ${relativePath}`)
                            );
                        }
                        const languageDirectory = join(
                            translationsDirectory,
                            RelativeFilePath.of(language),
                            RelativeFilePath.of("fern")
                        );
                        const destPath = join(languageDirectory, relativePath);

                        const destDir = path.dirname(destPath);
                        if (!existsSync(destDir)) {
                            await mkdir(destDir, { recursive: true });
                        }

                        const transformation: ContentTransformation = {
                            filePath: relativePath,
                            language,
                            sourceLanguage,
                            originalContent
                        };

                        const transformedContent = await transformContentForLanguage({
                            transformation,
                            cliContext,
                            stub
                        });
                        await writeFile(destPath, transformedContent, "utf-8");

                        const languageStatsForLang = languageStats[language];
                        if (languageStatsForLang) {
                            languageStatsForLang.filesProcessed++;
                        }
                        cliContext.logger.debug(`[COMPLETED] ${relativePath} -> ${language}/${relativePath}`);
                        if (progressBar) {
                            progressBar.update(processedFileIndex);
                        }
                    }
                }
            } finally {
                if (progressBar) {
                    progressBar.update(totalProgressItems);
                    progressBar.stop();
                    // Add a blank line after progress bar for cleaner output
                    cliContext.logger.info();
                }
            }

            // Hash mappings are now saved incrementally during processing, no need for final save

            // Copy asset files directly without processing
            context.logger.info(chalk.cyan("Copying asset files..."));
            let assetsCopied = 0;
            for (const [filePath, relativePath] of allFilesEntries) {
                if (isAssetFile(filePath)) {
                    for (const language of targetLanguages) {
                        const languageDirectory = join(
                            translationsDirectory,
                            RelativeFilePath.of(language),
                            RelativeFilePath.of("fern")
                        );
                        const destPath = join(languageDirectory, relativePath);

                        const destDir = path.dirname(destPath);
                        if (!existsSync(destDir)) {
                            await mkdir(destDir, { recursive: true });
                        }

                        // Copy asset file exactly as-is (binary copy)
                        await copyFile(filePath, destPath);
                        assetsCopied++;
                        cliContext.logger.debug(`[ASSET COPIED] ${relativePath} -> ${language}/${relativePath}`);
                    }
                }
            }

            if (assetsCopied > 0) {
                context.logger.info(chalk.green(`✓ Copied ${assetsCopied} asset files to translation directories`));
            }

            for (const language of languages) {
                const stats = languageStats[language];
                if (!stats) {
                    continue;
                }
                aggregateStats.filesProcessed += stats.filesProcessed;
                aggregateStats.filesSkipped += stats.filesSkipped;

                const totalFiles = stats.filesProcessed + stats.filesSkipped;
                if (language === sourceLanguage) {
                    context.logger.info(
                        chalk.blue(
                            `${language} (source) hash tracking summary: ${stats.filesProcessed} processed, ${stats.filesSkipped} skipped (${totalFiles} total)`
                        )
                    );
                    context.logger.info(
                        chalk.green(`✓ Successfully tracked ${language} source language hashes (no directory created)`)
                    );
                } else {
                    context.logger.info(
                        chalk.blue(
                            `${language} translation summary: ${stats.filesProcessed} processed, ${stats.filesSkipped} skipped (${totalFiles} total)`
                        )
                    );
                    context.logger.info(
                        chalk.green(`✓ Successfully created ${language} translation with content processing`)
                    );
                }
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes("403")) {
                throw error;
            }
            context.logger.error(`Failed to create translations: ${error}`);
            throw error;
        }

        const aggregateTotalFiles = aggregateStats.filesProcessed + aggregateStats.filesSkipped;
        context.logger.info(
            chalk.cyan(
                `Overall summary: ${aggregateStats.filesProcessed} files processed, ${aggregateStats.filesSkipped} files skipped across ${languages.length} languages (${aggregateTotalFiles} total operations)`
            )
        );

        context.logger.info(chalk.green(`Translations created successfully in: ${translationsDirectory}`));
        if (targetLanguages.length > 0) {
            context.logger.info(`You can now modify the content in each language directory:`);
            for (const language of targetLanguages) {
                context.logger.info(
                    chalk.blue(`  - ${language}: ${join(translationsDirectory, RelativeFilePath.of(language))}`)
                );
            }
        }
        context.logger.info(`Source language (${sourceLanguage}) values are tracked as hashes in translations/hashes`);
        if (hasDocsConfig && targetLanguages.length > 0) {
            context.logger.info("Language-specific docs configurations created with modified instance URLs:");
            for (const language of targetLanguages) {
                context.logger.info(`  - ${language}/docs.yml: URLs modified to include ${language} prefix`);
            }
        }
    });
}
