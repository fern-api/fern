import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import { existsSync, statSync } from "fs";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { CliContext } from "../../cli-context/CliContext";
import { transformContentForLanguage } from "./content-transformer";
import {
    cleanupHashMappings,
    FileHashMap,
    hasFileChanged,
    loadHashMappings,
    saveHashMappings,
    updateHashForFile
} from "./hash-utils";
import { ContentTransformation, ProcessingStats } from "./types";

export async function writeTranslationForProject({
    project,
    cliContext
}: {
    project: Project;
    cliContext: CliContext;
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
        const translationsDirectory = join(fernDirectory, RelativeFilePath.of(".translations"));

        const sourceLanguage = languages[0];
        if (!sourceLanguage) {
            throw new Error("Unexpected error - first element of languages array is invalid");
        }

        if (!existsSync(translationsDirectory)) {
            context.logger.debug(`Creating translations directory at: ${translationsDirectory}`);
            await mkdir(translationsDirectory, { recursive: true });
        }

        const languageStats: { [language: string]: ProcessingStats } = {};
        const targetLanguages = languages.filter((lang) => lang !== sourceLanguage);

        for (const language of targetLanguages) {
            const languageDirectory = join(translationsDirectory, RelativeFilePath.of(language));

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

            // clean up hash mappings for files that no longer exist
            const existingFileSet = new Set(Object.values(allFiles));
            hashMappings = cleanupHashMappings(hashMappings, existingFileSet);

            for (const [filePath, relativePath] of Object.entries(allFiles)) {
                const fileHasChanged = await hasFileChanged(filePath, relativePath, hashMappings);

                if (!fileHasChanged) {
                    // Update stats for all languages (including source) even though we skip processing
                    for (const language of languages) {
                        languageStats[language]!.filesSkipped++;
                    }
                    cliContext.logger.debug(`[SKIPPED] ${relativePath} (no changes since last translation)`);
                    continue;
                }

                cliContext.logger.debug(`[PROCESSING] ${relativePath} (detected changes)`);

                const originalContent = await readFile(filePath, "utf-8");
                updateHashForFile(hashMappings, relativePath, originalContent);

                // Process source language for stats tracking but don't create files
                languageStats[sourceLanguage]!.filesProcessed++;
                cliContext.logger.debug(
                    `[HASH UPDATED] ${relativePath} -> ${sourceLanguage} (source language - hash only)`
                );

                // Only create translation files for target languages (non-source languages)
                for (const language of targetLanguages) {
                    const languageDirectory = join(translationsDirectory, RelativeFilePath.of(language));
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

                    const transformedContent = transformContentForLanguage(transformation, cliContext);
                    await writeFile(destPath, transformedContent, "utf-8");

                    languageStats[language]!.filesProcessed++;
                    cliContext.logger.debug(`[COMPLETED] ${relativePath} -> ${language}/${relativePath}`);
                }
            }

            await saveHashMappings(translationsDirectory, hashMappings);

            for (const language of languages) {
                const stats = languageStats[language]!;
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
        context.logger.info(
            `Source language (${sourceLanguage}) values are tracked as hashes in .translations/.hashes`
        );
    });
}

async function collectFiles(
    baseDirectory: string,
    relativeBase: RelativeFilePath | ""
): Promise<Record<string, RelativeFilePath>> {
    const discoveredFiles: Record<string, RelativeFilePath> = {};

    const entries = await readdir(baseDirectory);

    for (const entry of entries) {
        // skip the .translations directory
        if (entry === ".translations") {
            continue;
        }

        const fullPath = path.join(baseDirectory, entry);
        const relativePath = relativeBase ? join(relativeBase, RelativeFilePath.of(entry)) : RelativeFilePath.of(entry);

        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            const subdirectoryFiles = await collectFiles(fullPath, relativePath);
            for (const [subPath, subRelativePath] of Object.entries(subdirectoryFiles)) {
                discoveredFiles[subPath] = subRelativePath;
            }
        } else if (stat.isFile()) {
            discoveredFiles[fullPath] = relativePath;
        }
    }

    return discoveredFiles;
}
