import { docsYml } from "@fern-api/configuration";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { CliContext } from "../../cli-context/CliContext";
import { transformContentForLanguage } from "./content-transformer";
import { ContentTransformation } from "./types";
import { addLanguageSuffixToUrl } from "./url-utils";

type DocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.Raw;
type Language = docsYml.RawSchemas.Language;
type DocsInstance = docsYml.RawSchemas.Serializer.DocsInstance.Raw;

/**
 * Modifies docs configuration by adding language settings and updating instance URLs.
 * @param docsConfig - The original docs configuration
 * @param language - The target language
 * @returns Modified docs configuration
 */
export function modifyDocsConfig(docsConfig: DocsConfiguration, language: Language): DocsConfiguration {
    const configWithLanguage = modifySettingsConfigForLanguage({ docsConfig, language });
    return modifyInstanceUrlsForLanguage({ docsConfig: configWithLanguage, language });
}

/**
 * Adds language setting to docs configuration.
 * @param docsConfig - The original docs configuration
 * @param language - The target language
 * @returns Configuration with language setting added
 */
function modifySettingsConfigForLanguage({
    docsConfig,
    language
}: {
    docsConfig: DocsConfiguration;
    language: Language;
}): DocsConfiguration {
    const modifiedConfig = structuredClone(docsConfig);

    if (modifiedConfig.settings) {
        modifiedConfig.settings.language = language;
        modifiedConfig.settings["search-text"] = searchTexts[language];
    } else {
        modifiedConfig.settings = {
            language,
            "search-text": searchTexts[language]
        };
    }
    return modifiedConfig;
}

const searchTexts: Record<Language, string> = {
    en: "Search",
    es: "Buscar",
    fr: "Rechercher",
    de: "Suchen",
    it: "Cerca",
    pt: "Pesquisar",
    ja: "検索",
    zh: "搜索",
    ko: "검색",
    el: "Αναζήτηση",
    no: "Søk",
    pl: "Szukaj",
    ru: "Поиск",
    sv: "Sök",
    tr: "Ara"
};

/**
 * Modifies instance URLs in docs configuration to add language suffixes.
 * @param docsConfig - The original docs configuration
 * @param language - The target language
 * @returns Modified docs configuration with language-suffixed URLs
 */
function modifyInstanceUrlsForLanguage({
    docsConfig,
    language
}: {
    docsConfig: DocsConfiguration;
    language: Language;
}): DocsConfiguration {
    const modifiedConfig = structuredClone(docsConfig);

    if (modifiedConfig.instances && Array.isArray(modifiedConfig.instances)) {
        modifiedConfig.instances = modifiedConfig.instances.map((instance: DocsInstance) => {
            const modifiedInstance = { ...instance };

            if (modifiedInstance.url) {
                modifiedInstance.url = addLanguageSuffixToUrl(modifiedInstance.url, language);
            }

            if (modifiedInstance["custom-domain"]) {
                const customDomain = modifiedInstance["custom-domain"];
                if (typeof customDomain === "string") {
                    modifiedInstance["custom-domain"] = addLanguageSuffixToUrl(customDomain, language);
                } else if (Array.isArray(customDomain)) {
                    modifiedInstance["custom-domain"] = customDomain.map((domain: string) =>
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
 * @param sourceLanguage - The source language
 * @param context - CLI context for logging
 * @param stub - If true, returns content as-is without calling translation service
 */
export async function createLanguageSpecificDocsConfig({
    originalDocsConfigPath,
    targetDirectory,
    language,
    sourceLanguage,
    context,
    stub = false
}: {
    originalDocsConfigPath: AbsoluteFilePath;
    targetDirectory: AbsoluteFilePath;
    language: Language;
    sourceLanguage: Language;
    context: CliContext;
    stub: boolean;
}): Promise<void> {
    try {
        const originalConfigContent = await readFile(originalDocsConfigPath, "utf-8");

        // First, translate the content
        const transformation: ContentTransformation = {
            filePath: DOCS_CONFIGURATION_FILENAME,
            language,
            sourceLanguage,
            originalContent: originalConfigContent
        };
        const translatedContent = await transformContentForLanguage({ transformation, cliContext: context, stub });

        // Then parse the translated content and modify URLs
        const translatedConfig = yaml.load(translatedContent) as DocsConfiguration;
        const modifiedConfig = modifyDocsConfig(translatedConfig, language);

        const modifiedConfigPath = join(targetDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
        const modifiedConfigContent = yaml.dump(modifiedConfig, {
            sortKeys: false
        });
        await writeFile(modifiedConfigPath, modifiedConfigContent, "utf-8");

        context.logger.debug(`Created language-specific docs config: ${modifiedConfigPath}`);
    } catch (error) {
        if (error instanceof Error && error.message.includes("403")) {
            throw error;
        }

        context.logger.warn(`Failed to create language-specific docs config for ${language}: ${error}`);
    }
}
