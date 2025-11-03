import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import { existsSync, statSync } from "fs";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { CliContext } from "../../cli-context/CliContext";
import { transformContentForLanguage } from "./content-transformer";
import {
    cleanupHashMappings,
    hasFileChanged,
    loadHashMappings,
    saveHashMappings,
    updateHashForFile
} from "./hash-utils";
import { ContentTransformation, ProcessingStats } from "./types";

/**
 * Adds a language prefix to a URL using subdomain format.
 * @param url - The original URL
 * @param language - The language to add as a subdomain prefix
 * @returns The URL with the language prefix in the subdomain
 * @example
 * - "https://org.docs.buildwithfern.com" -> "https://org-de.docs.buildwithfern.com"
 * - "https://docs.custom.com" -> "https://de.docs.custom.com"
 * - "https://docs.custom.com/path" -> "https://de.docs.custom.com/path"
 */
export function addLanguageSuffixToUrl(url: string, language: string): string {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        if (hostname.endsWith(".docs.buildwithfern.com")) {
            const org = hostname.replace(".docs.buildwithfern.com", "");
            urlObj.hostname = `${org}-${language}.docs.buildwithfern.com`;
        }
        else {
            urlObj.hostname = `${language}.${hostname}`;
        }

        return urlObj.toString();
    } catch {
        // fallback parsing for invalid URLs
        if (url.includes("://")) {
            const [protocol, rest] = url.split("://");
            const [hostAndPath, ...fragments] = rest?.split("#") ?? [];
            const [hostAndQuery, ...hashParts] = hostAndPath?.split("?") ?? [];
            const [hostname, ...pathParts] = hostAndQuery?.split("/") ?? [];

            if (!hostname) {
                return url;
            }

            let newHostname: string;
            if (hostname.endsWith(".docs.buildwithfern.com")) {
                const orgPart = hostname.replace(".docs.buildwithfern.com", "");
                newHostname = `${orgPart}-${language}.docs.buildwithfern.com`;
            } else {
                newHostname = `${language}.${hostname}`;
            }

            let result = `${protocol}://${newHostname}`;
            if (pathParts.length > 0) {
                result += "/" + pathParts.join("/");
            }
            if (hashParts.length > 0) {
                result += "?" + hashParts.join("?");
            }
            if (fragments.length > 0) {
                result += "#" + fragments.join("#");
            }

            return result;
        } else {
            if (url.includes("/")) {
                const parts = url.split("/");
                const hostname = parts[0];
                const pathParts = parts.slice(1);

                let newHostname: string;
                if (hostname?.endsWith(".docs.buildwithfern.com")) {
                    const orgPart = hostname.replace(".docs.buildwithfern.com", "");
                    newHostname = `${orgPart}-${language}.docs.buildwithfern.com`;
                } else {
                    newHostname = `${language}.${hostname}`;
                }

                if (pathParts.length > 0) {
                    return `${newHostname}/${pathParts.join("/")}`;
                } else {
                    return newHostname;
                }
            } else {
                if (url.endsWith(".docs.buildwithfern.com")) {
                    const orgPart = url.replace(".docs.buildwithfern.com", "");
                    return `${orgPart}-${language}.docs.buildwithfern.com`;
                } else {
                    return `${language}.${url}`;
                }
            }
        }
    }
}

/**
 * Modifies instance URLs in docs configuration to add language suffixes.
 * @param docsConfig - The original docs configuration
 * @param language - The target language
 * @returns Modified docs configuration with language-suffixed URLs
 */
function modifyInstanceUrlsForLanguage(docsConfig: any, language: string): any {
    const modifiedConfig = structuredClone(docsConfig);

    if (modifiedConfig.instances && Array.isArray(modifiedConfig.instances)) {
        modifiedConfig.instances = modifiedConfig.instances.map((instance: any) => {
            const modifiedInstance = { ...instance };

            if (modifiedInstance.url) {
                modifiedInstance.url = addLanguageSuffixToUrl(modifiedInstance.url, language);
            }

            // Handle both customDomain (camelCase) and custom-domain (kebab-case)
            const customDomainKey = modifiedInstance.customDomain ? "customDomain" : "custom-domain";
            const customDomain = modifiedInstance.customDomain || modifiedInstance["custom-domain"];

            if (customDomain) {
                if (typeof customDomain === "string") {
                    modifiedInstance[customDomainKey] = addLanguageSuffixToUrl(customDomain, language);
                } else if (Array.isArray(customDomain)) {
                    modifiedInstance[customDomainKey] = customDomain.map((domain: string) =>
                        addLanguageSuffixToUrl(domain, language)
                    );
                }
            }

            return modifiedInstance;
        });
    }

    return modifiedConfig;
}

/**
 * Creates and writes a modified docs.yml file for a specific language.
 * @param originalDocsConfigPath - Path to the original docs.yml
 * @param targetDirectory - Directory where the modified config should be written
 * @param language - The target language
 * @param context - CLI context for logging
 */
async function createLanguageSpecificDocsConfig(
    originalDocsConfigPath: AbsoluteFilePath,
    targetDirectory: AbsoluteFilePath,
    language: string,
    context: CliContext
): Promise<void> {
    try {
        const originalConfigContent = await readFile(originalDocsConfigPath, "utf-8");
        const originalConfig = yaml.load(originalConfigContent);

        const modifiedConfig = modifyInstanceUrlsForLanguage(originalConfig, language);

        const modifiedConfigPath = join(targetDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
        const modifiedConfigContent = yaml.dump(modifiedConfig, { sortKeys: false });
        await writeFile(modifiedConfigPath, modifiedConfigContent, "utf-8");

        context.logger.debug(`Created language-specific docs config: ${modifiedConfigPath}`);
    } catch (error) {
        context.logger.warn(`Failed to create language-specific docs config for ${language}: ${error}`);
    }
}

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
        const translationsDirectory = join(fernDirectory, RelativeFilePath.of("translations"));

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

        const originalDocsConfigPath = join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
        const hasDocsConfig = existsSync(originalDocsConfigPath);

        for (const language of targetLanguages) {
            const languageDirectory = join(translationsDirectory, RelativeFilePath.of(language));

            if (!existsSync(languageDirectory)) {
                await mkdir(languageDirectory, { recursive: true });
            }

            if (hasDocsConfig) {
                await createLanguageSpecificDocsConfig(originalDocsConfigPath, languageDirectory, language, cliContext);
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
                if (hasDocsConfig && relativePath === DOCS_CONFIGURATION_FILENAME) {
                    cliContext.logger.debug(
                        `[SKIPPED] ${relativePath} (handled by language-specific docs config creation)`
                    );
                    // still update hash for source language tracking
                    const originalContent = await readFile(filePath, "utf-8");
                    updateHashForFile(hashMappings, relativePath, originalContent);
                    const sourceStats = languageStats[sourceLanguage];
                    if (sourceStats) {
                        sourceStats.filesSkipped++; // count as skipped rather than processed
                    }
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
                updateHashForFile(hashMappings, relativePath, originalContent);

                const sourceStats = languageStats[sourceLanguage];
                if (sourceStats) {
                    sourceStats.filesProcessed++;
                }
                cliContext.logger.debug(
                    `[HASH UPDATED] ${relativePath} -> ${sourceLanguage} (source language - hash only)`
                );

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

                    const languageStatsForLang = languageStats[language];
                    if (languageStatsForLang) {
                        languageStatsForLang.filesProcessed++;
                    }
                    cliContext.logger.debug(`[COMPLETED] ${relativePath} -> ${language}/${relativePath}`);
                }
            }

            await saveHashMappings(translationsDirectory, hashMappings);

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
            context.logger.info(
                chalk.green("Language-specific docs configurations created with modified instance URLs:")
            );
            for (const language of targetLanguages) {
                context.logger.info(
                    chalk.blue(`  - ${language}/docs.yml: URLs modified to include /${language} suffix`)
                );
            }
        }
    });
}

async function collectFiles(
    baseDirectory: string,
    relativeBase: RelativeFilePath | ""
): Promise<Record<string, RelativeFilePath>> {
    const discoveredFiles: Record<string, RelativeFilePath> = {};

    const entries = await readdir(baseDirectory);

    for (const entry of entries) {
        // skip the translations directory
        if (entry === "translations") {
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
