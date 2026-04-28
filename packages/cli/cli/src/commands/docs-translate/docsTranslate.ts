import { docsYml } from "@fern-api/configuration";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { checkbox, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";

import { CliContext } from "../../cli-context/CliContext.js";

type Language = docsYml.RawSchemas.Language;

const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
    en: "English",
    es: "Spanish (Español)",
    fr: "French (Français)",
    de: "German (Deutsch)",
    it: "Italian (Italiano)",
    pt: "Portuguese (Português)",
    ja: "Japanese (日本語)",
    zh: "Chinese (中文)",
    ko: "Korean (한국어)",
    el: "Greek (Ελληνικά)",
    no: "Norwegian (Norsk)",
    pl: "Polish (Polski)",
    ru: "Russian (Русский)",
    sv: "Swedish (Svenska)",
    tr: "Turkish (Türkçe)"
};

const ALL_LANGUAGES: Language[] = [
    docsYml.RawSchemas.Language.En,
    docsYml.RawSchemas.Language.Es,
    docsYml.RawSchemas.Language.Fr,
    docsYml.RawSchemas.Language.De,
    docsYml.RawSchemas.Language.It,
    docsYml.RawSchemas.Language.Pt,
    docsYml.RawSchemas.Language.Ja,
    docsYml.RawSchemas.Language.Zh,
    docsYml.RawSchemas.Language.Ko,
    docsYml.RawSchemas.Language.El,
    docsYml.RawSchemas.Language.No,
    docsYml.RawSchemas.Language.Pl,
    docsYml.RawSchemas.Language.Ru,
    docsYml.RawSchemas.Language.Sv,
    docsYml.RawSchemas.Language.Tr
];

interface ExistingTranslationState {
    defaultLang: Language | undefined;
    configuredLangs: Language[];
}

function getExistingTranslationState(config: docsYml.RawSchemas.DocsConfiguration): ExistingTranslationState {
    if (config.translations != null && config.translations.length > 0) {
        const defaultLang = config.translations.find((t) => t.default === true)?.lang ?? config.translations[0]?.lang;
        const configuredLangs = config.translations.map((t) => t.lang);
        return { defaultLang, configuredLangs };
    }

    if (config.languages != null && config.languages.length > 0) {
        const defaultLang = config.languages[0];
        return { defaultLang, configuredLangs: config.languages };
    }

    return { defaultLang: undefined, configuredLangs: [] };
}

function buildTranslationsYamlBlock(defaultLang: Language, targetLangs: Language[]): string {
    const lines: string[] = [];
    lines.push("translations:");
    lines.push(`  - lang: ${defaultLang}`);
    lines.push("    default: true");
    for (const lang of targetLangs) {
        lines.push(`  - lang: ${lang}`);
    }
    return lines.join("\n");
}

function updateDocsYamlContent({
    rawContent,
    defaultLang,
    allTargetLangs
}: {
    rawContent: string;
    defaultLang: Language;
    allTargetLangs: Language[];
}): string {
    const translationsBlock = buildTranslationsYamlBlock(defaultLang, allTargetLangs);

    const translationsRegex = /^translations:\s*\n(?:\s+-[^\n]*\n?)*/m;
    if (translationsRegex.test(rawContent)) {
        return rawContent.replace(translationsRegex, translationsBlock + "\n");
    }

    const languagesRegex = /^languages:\s*\n(?:\s+-[^\n]*\n?)*/m;
    if (languagesRegex.test(rawContent)) {
        return rawContent.replace(languagesRegex, translationsBlock + "\n");
    }

    return rawContent.trimEnd() + "\n\n" + translationsBlock + "\n";
}

export async function docsTranslate({
    project,
    cliContext
}: {
    project: Project;
    cliContext: CliContext;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.failAndThrow("No docs workspace found. Please ensure you have a docs.yml file configured.");
        return;
    }

    const fernDirectory = docsWorkspace.absoluteFilePath;
    const docsConfigPath = join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));

    cliContext.logger.info("");
    cliContext.logger.info(chalk.bold("🌐 Fern Docs — Internationalization Setup"));
    cliContext.logger.info(chalk.dim("─".repeat(45)));
    cliContext.logger.info("");

    const existingState = getExistingTranslationState(docsWorkspace.config);

    if (existingState.configuredLangs.length > 0) {
        cliContext.logger.info(
            chalk.cyan("  Existing translations detected: ") +
                existingState.configuredLangs.map((l) => chalk.bold(LANGUAGE_DISPLAY_NAMES[l])).join(", ")
        );
        if (existingState.defaultLang != null) {
            cliContext.logger.info(
                chalk.cyan("  Default language: ") + chalk.bold(LANGUAGE_DISPLAY_NAMES[existingState.defaultLang])
            );
        }
        cliContext.logger.info("");
    }

    const alreadyConfigured = new Set(existingState.configuredLangs);
    const availableLanguages = ALL_LANGUAGES.filter((lang) => !alreadyConfigured.has(lang));

    if (availableLanguages.length === 0) {
        cliContext.logger.info(chalk.green("  All supported languages are already configured!"));
        cliContext.logger.info("");
        return;
    }

    let defaultLang = existingState.defaultLang;
    if (defaultLang == null) {
        cliContext.logger.info(
            chalk.white("  Your default (source) language will be set to ") + chalk.bold("English") + chalk.white(".")
        );
        cliContext.logger.info(chalk.dim("  This is the language your existing docs are written in."));
        cliContext.logger.info("");

        const confirmDefault = await confirm({
            message: "Is English your default documentation language?",
            default: true
        });

        if (confirmDefault) {
            defaultLang = docsYml.RawSchemas.Language.En;
        } else {
            const allLangsForDefault = ALL_LANGUAGES;
            const selectedDefault = await checkbox<Language>({
                message: "Select your default (source) language:",
                choices: allLangsForDefault.map((lang) => ({
                    name: LANGUAGE_DISPLAY_NAMES[lang],
                    value: lang
                })),
                required: true,
                validate: (selected) => {
                    if (selected.length !== 1) {
                        return "Please select exactly one default language.";
                    }
                    return true;
                }
            });

            const pickedDefault = selectedDefault[0];
            if (pickedDefault == null) {
                cliContext.failAndThrow("No default language selected.");
                return;
            }
            defaultLang = pickedDefault;
        }

        cliContext.logger.info("");
        cliContext.logger.info(
            chalk.green("  ✓ ") + chalk.white("Default language: ") + chalk.bold(LANGUAGE_DISPLAY_NAMES[defaultLang])
        );
        cliContext.logger.info("");
    }

    if (defaultLang == null) {
        cliContext.failAndThrow("Unable to determine default language.");
        return;
    }

    const languagesForSelection = availableLanguages.filter((lang) => lang !== defaultLang);

    if (languagesForSelection.length === 0) {
        cliContext.logger.info(chalk.green("  All supported languages are already configured!"));
        cliContext.logger.info("");
        return;
    }

    const selectedLanguages = await checkbox<Language>({
        message: "Which languages would you like to add for translation?",
        choices: languagesForSelection.map((lang) => ({
            name: LANGUAGE_DISPLAY_NAMES[lang],
            value: lang
        })),
        required: true,
        validate: (selected) => {
            if (selected.length === 0) {
                return "Please select at least one language.";
            }
            return true;
        }
    });

    if (selectedLanguages.length === 0) {
        cliContext.logger.info(chalk.yellow("  No languages selected. Exiting."));
        return;
    }

    cliContext.logger.info("");
    cliContext.logger.info(chalk.bold("  Selected languages:"));
    for (const lang of selectedLanguages) {
        cliContext.logger.info(chalk.cyan(`    • ${LANGUAGE_DISPLAY_NAMES[lang]}`) + chalk.dim(` (${lang})`));
    }
    cliContext.logger.info("");

    // Merge newly selected with existing non-default languages
    const existingTargetLangs = existingState.configuredLangs.filter((l) => l !== defaultLang);
    const allTargetLangs = [...existingTargetLangs, ...selectedLanguages];

    // Step 1: Update docs.yml
    cliContext.logger.info(chalk.dim("─".repeat(45)));
    cliContext.logger.info(chalk.bold("  Updating configuration..."));
    cliContext.logger.info("");

    const rawDocsContent = await readFile(docsConfigPath, "utf-8");
    const updatedContent = updateDocsYamlContent({
        rawContent: rawDocsContent,
        defaultLang,
        allTargetLangs
    });
    await writeFile(docsConfigPath, updatedContent, "utf-8");

    cliContext.logger.info(chalk.green("  ✓ ") + chalk.white(`Updated ${DOCS_CONFIGURATION_FILENAME}`));

    // Step 2: Create translation directories
    cliContext.logger.info("");
    cliContext.logger.info(chalk.bold("  Creating translation directories..."));
    cliContext.logger.info("");

    const translationsDirectory = join(fernDirectory, RelativeFilePath.of("translations"));

    for (const lang of selectedLanguages) {
        const langDir = join(translationsDirectory, RelativeFilePath.of(lang));

        if (existsSync(langDir)) {
            cliContext.logger.info(
                chalk.yellow("  ○ ") + chalk.dim(`translations/${lang}/`) + chalk.dim(" (already exists)")
            );
            continue;
        }

        await mkdir(langDir, { recursive: true });
        cliContext.logger.info(chalk.green("  ✓ ") + chalk.white(`Created translations/${lang}/`));
    }

    // Summary
    cliContext.logger.info("");
    cliContext.logger.info(chalk.dim("─".repeat(45)));
    cliContext.logger.info(chalk.bold("  🎉 Internationalization setup complete!"));
    cliContext.logger.info("");
    cliContext.logger.info(chalk.white("  Your documentation now supports:"));
    cliContext.logger.info(chalk.bold(`    ${LANGUAGE_DISPLAY_NAMES[defaultLang]}`) + chalk.dim(" (default)"));
    for (const lang of allTargetLangs) {
        cliContext.logger.info(chalk.bold(`    ${LANGUAGE_DISPLAY_NAMES[lang]}`));
    }

    cliContext.logger.info("");
    cliContext.logger.info(chalk.bold("  Next steps:"));
    cliContext.logger.info(
        chalk.white("  1. Add translated pages under each ") +
            chalk.cyan("translations/<lang>/") +
            chalk.white(" directory")
    );
    cliContext.logger.info(chalk.white("  2. Mirror the same file paths from your main docs"));
    cliContext.logger.info(
        chalk.white("  3. Run ") +
            chalk.cyan("fern generate --docs") +
            chalk.white(" to publish your translated documentation")
    );
    cliContext.logger.info("");
}
