import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { Rule, RuleViolation } from "../../Rule.js";

const SUPPORTED_TRANSLATION_LOCALES = [
    "en",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "ja",
    "zh",
    "ko",
    "el",
    "no",
    "pl",
    "ru",
    "sv",
    "tr"
];

const supportedTranslationLocales = new Set(SUPPORTED_TRANSLATION_LOCALES);

interface SourceLocation {
    line: number;
    column: number;
}

interface TranslationsConfigLocations {
    languagesLine: SourceLocation | undefined;
    languageEntries: Map<number, SourceLocation>;
    settingsLanguage: SourceLocation | undefined;
}

export function getCanonicalLocale(locale: string): string | undefined {
    try {
        return Intl.getCanonicalLocales(locale)[0];
    } catch {
        return undefined;
    }
}

export function validateTranslationsConfig({
    languages,
    settingsLanguage,
    locations
}: {
    languages: string[] | undefined;
    settingsLanguage: string | undefined;
    locations?: TranslationsConfigLocations;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (languages == null || languages.length === 0) {
        if (settingsLanguage != null) {
            violations.push({
                severity: "fatal",
                message:
                    "`settings.language` is configured, but `languages` is missing. " +
                    `Add languages in ${formatFixLocation(locations?.settingsLanguage)} with the source locale as the first entry.`,
                nodePath: ["settings", "language"]
            });
        }
        return violations;
    }

    const canonicalLocaleToEntries = new Map<string, Array<{ index: number; locale: string }>>();

    for (let index = 0; index < languages.length; index++) {
        const locale = languages[index];
        if (locale == null || locale.trim().length === 0) {
            violations.push({
                severity: "fatal",
                message:
                    `languages[${index}] is empty. Fix in ${formatFixLocation(locations?.languageEntries.get(index))}. ` +
                    `Supported locales are: ${SUPPORTED_TRANSLATION_LOCALES.join(", ")}.`,
                nodePath: getLanguagesNodePath(index)
            });
            continue;
        }

        const canonicalLocale = getCanonicalLocale(locale);
        if (canonicalLocale == null) {
            violations.push({
                severity: "fatal",
                message:
                    `"${locale}" is not a supported locale. Fix in ${formatFixLocation(locations?.languageEntries.get(index))}. ` +
                    `Supported locales are: ${SUPPORTED_TRANSLATION_LOCALES.join(", ")}.`,
                nodePath: getLanguagesNodePath(index)
            });
            continue;
        }

        const existingEntries = canonicalLocaleToEntries.get(canonicalLocale) ?? [];
        existingEntries.push({ index, locale });
        canonicalLocaleToEntries.set(canonicalLocale, existingEntries);

        if (!supportedTranslationLocales.has(canonicalLocale)) {
            violations.push({
                severity: "fatal",
                message:
                    `"${locale}" is not a supported locale. Fix in ${formatFixLocation(locations?.languageEntries.get(index))}. ` +
                    `Supported locales are: ${SUPPORTED_TRANSLATION_LOCALES.join(", ")}.`,
                nodePath: getLanguagesNodePath(index)
            });
        }
    }

    for (const [canonicalLocale, entries] of canonicalLocaleToEntries.entries()) {
        if (entries.length > 1) {
            violations.push({
                severity: "fatal",
                message:
                    `Duplicate locale "${canonicalLocale}" in docs.yml at ${entries.map((entry) => `languages[${entry.index}]`).join(" and ")}. ` +
                    `Remove one entry. Fix in ${formatFixLocation(locations?.languageEntries.get(entries[1]?.index ?? entries[0]?.index ?? 0))}.`,
                nodePath: getLanguagesNodePath(entries[1]?.index ?? entries[0]?.index ?? 0)
            });
        }
    }

    if (settingsLanguage != null && settingsLanguage !== languages[0]) {
        violations.push({
            severity: "fatal",
            message:
                `settings.language is "${settingsLanguage}", but languages[0] is "${languages[0]}". ` +
                `Fix in ${formatFixLocation(locations?.settingsLanguage)} to match the source locale, or reorder languages so "${settingsLanguage}" is first.`,
            nodePath: ["settings", "language"]
        });
    }

    return violations;
}

function getLanguagesNodePath(index: number): RuleViolation["nodePath"] {
    return [{ key: "languages", arrayIndex: index }];
}

function formatFixLocation(location: SourceLocation | undefined): string {
    if (location == null) {
        return "fern/docs.yml";
    }
    return `fern/docs.yml:${location.line}:${location.column}`;
}

function getSupportedCanonicalLocale(locale: string): string | undefined {
    const canonicalLocale = getCanonicalLocale(locale);
    if (canonicalLocale == null || !supportedTranslationLocales.has(canonicalLocale)) {
        return undefined;
    }
    return canonicalLocale;
}

export async function validateTranslationsSourceStorage({
    absolutePathToFernDirectory,
    languages,
    locations
}: {
    absolutePathToFernDirectory: string;
    languages: string[] | undefined;
    locations?: TranslationsConfigLocations;
}): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];
    if (languages == null || languages.length === 0) {
        return violations;
    }

    const advertisedTranslationLocales = new Set<string>();
    for (const language of languages.slice(1)) {
        const canonicalLocale = getSupportedCanonicalLocale(language);
        if (canonicalLocale != null) {
            advertisedTranslationLocales.add(canonicalLocale);
        }
    }

    const translationsDirectory = path.join(absolutePathToFernDirectory, "translations");

    for (const locale of advertisedTranslationLocales) {
        const localeDirectory = path.join(translationsDirectory, locale);
        if (!existsSync(localeDirectory)) {
            violations.push({
                severity: "fatal",
                message:
                    `${locale} is listed as a locale in docs.yml, but fern/translations/${locale}/ is missing.\n\n` +
                    renderTranslationsDirectoryTree({
                        locale,
                        marker: "<-- missing"
                    }) +
                    `\n\nAdd fern/translations/${locale}/ or remove "${locale}" from languages in ${formatFixLocation(getLanguageLocationForLocale({ locale, languages, locations }))}.`
            });
            continue;
        }
    }

    if (!existsSync(translationsDirectory)) {
        return violations;
    }

    const translationDirectoryEntries = await readdir(translationsDirectory, { withFileTypes: true });
    for (const entry of translationDirectoryEntries) {
        if (!entry.isDirectory()) {
            continue;
        }

        const canonicalLocale = getSupportedCanonicalLocale(entry.name);
        if (canonicalLocale == null) {
            violations.push({
                severity: "fatal",
                message:
                    `${entry.name} is present in the translations directory, but it is not a supported docs translation locale.\n\n` +
                    renderTranslationsDirectoryTree({
                        locale: entry.name,
                        marker: "<-- unsupported locale"
                    }) +
                    `\n\nSupported locales are: ${SUPPORTED_TRANSLATION_LOCALES.join(", ")}.`
            });
            continue;
        }

        if (!advertisedTranslationLocales.has(canonicalLocale)) {
            violations.push({
                severity: "fatal",
                message:
                    `${canonicalLocale} is not listed as a locale in docs.yml but is present in the translations directory.\n\n` +
                    renderTranslationsDirectoryTree({
                        locale: entry.name,
                        marker: "<-- not listed in docs.yml"
                    }) +
                    `\n\nAdd "${canonicalLocale}" to languages in ${formatFixLocation(locations?.languagesLine)} or remove fern/translations/${entry.name}/.`
            });
        }
    }

    return violations;
}

function renderTranslationsDirectoryTree({ locale, marker }: { locale: string; marker: string }): string {
    return `fern/
  docs.yml
  translations/
    ${locale}/ ${marker}`;
}

function getLanguageLocationForLocale({
    locale,
    languages,
    locations
}: {
    locale: string;
    languages: string[] | undefined;
    locations: TranslationsConfigLocations | undefined;
}): SourceLocation | undefined {
    const index = languages?.findIndex((language) => getCanonicalLocale(language) === locale);
    return index != null && index >= 0 ? locations?.languageEntries.get(index) : locations?.languagesLine;
}

export async function getTranslationsConfigLocations(
    absolutePathToFernDirectory: string
): Promise<TranslationsConfigLocations> {
    const docsYmlPath = path.join(absolutePathToFernDirectory, "docs.yml");
    const locations: TranslationsConfigLocations = {
        languagesLine: undefined,
        languageEntries: new Map(),
        settingsLanguage: undefined
    };

    let contents: string;
    try {
        contents = await readFile(docsYmlPath, "utf-8");
    } catch {
        return locations;
    }

    const lines = contents.split(/\r?\n/);
    const languagesLineIndex = findTopLevelKeyLine(lines, "languages");
    if (languagesLineIndex != null) {
        const line = lines[languagesLineIndex] ?? "";
        locations.languagesLine = {
            line: languagesLineIndex + 1,
            column: getColumnForToken(line, "languages")
        };
        collectLanguageEntryLocations({ lines, languagesLineIndex, locations });
    }

    const settingsLineIndex = findTopLevelKeyLine(lines, "settings");
    if (settingsLineIndex != null) {
        locations.settingsLanguage = findNestedKeyLocation({
            lines,
            parentLineIndex: settingsLineIndex,
            key: "language"
        });
    }

    return locations;
}

function findTopLevelKeyLine(lines: string[], key: string): number | undefined {
    const keyPattern = new RegExp(`^${escapeRegExp(key)}\\s*:`);
    for (let index = 0; index < lines.length; index++) {
        const line = stripYamlComment(lines[index] ?? "");
        if (keyPattern.test(line)) {
            return index;
        }
    }
    return undefined;
}

function collectLanguageEntryLocations({
    lines,
    languagesLineIndex,
    locations
}: {
    lines: string[];
    languagesLineIndex: number;
    locations: TranslationsConfigLocations;
}): void {
    const languagesLine = stripYamlComment(lines[languagesLineIndex] ?? "");
    if (languagesLine.includes("[")) {
        collectInlineLanguageEntryLocations({ line: languagesLine, lineIndex: languagesLineIndex, locations });
        return;
    }

    let languageIndex = 0;
    for (let lineIndex = languagesLineIndex + 1; lineIndex < lines.length; lineIndex++) {
        const line = stripYamlComment(lines[lineIndex] ?? "");
        if (isTopLevelYamlKey(line)) {
            return;
        }
        const listItemMatch = line.match(/^(\s*)-\s*(.*)$/);
        if (listItemMatch == null) {
            continue;
        }
        const value = listItemMatch[2] ?? "";
        locations.languageEntries.set(languageIndex, {
            line: lineIndex + 1,
            column: getColumnForToken(line, value.trim().length > 0 ? value.trim() : "-")
        });
        languageIndex++;
    }
}

function collectInlineLanguageEntryLocations({
    line,
    lineIndex,
    locations
}: {
    line: string;
    lineIndex: number;
    locations: TranslationsConfigLocations;
}): void {
    const listStart = line.indexOf("[");
    const listEnd = line.indexOf("]", listStart);
    if (listStart === -1 || listEnd === -1) {
        return;
    }

    const listContent = line.slice(listStart + 1, listEnd);
    let searchOffset = listStart + 1;
    for (const [languageIndex, rawValue] of listContent.split(",").entries()) {
        const value = rawValue.trim();
        const valueOffset = value.length > 0 ? line.indexOf(value, searchOffset) : searchOffset;
        locations.languageEntries.set(languageIndex, {
            line: lineIndex + 1,
            column: valueOffset >= 0 ? valueOffset + 1 : listStart + 2
        });
        searchOffset = valueOffset >= 0 ? valueOffset + rawValue.length : searchOffset + rawValue.length;
    }
}

function findNestedKeyLocation({
    lines,
    parentLineIndex,
    key
}: {
    lines: string[];
    parentLineIndex: number;
    key: string;
}): SourceLocation | undefined {
    const keyPattern = new RegExp(`^\\s+${escapeRegExp(key)}\\s*:`);
    for (let lineIndex = parentLineIndex + 1; lineIndex < lines.length; lineIndex++) {
        const line = stripYamlComment(lines[lineIndex] ?? "");
        if (isTopLevelYamlKey(line)) {
            return undefined;
        }
        if (keyPattern.test(line)) {
            return {
                line: lineIndex + 1,
                column: getColumnForToken(line, key)
            };
        }
    }
    return undefined;
}

function isTopLevelYamlKey(line: string): boolean {
    return /^[A-Za-z0-9_-]+:/.test(line);
}

function stripYamlComment(line: string): string {
    return line.split("#")[0] ?? "";
}

function getColumnForToken(line: string, token: string): number {
    const column = line.indexOf(token);
    return column >= 0 ? column + 1 : 1;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const ValidTranslationsConfigRule: Rule = {
    name: "valid-translations-config",
    create: async ({ workspace }) => {
        const locations = await getTranslationsConfigLocations(workspace.absoluteFilePath);
        return {
            file: async ({ config }) => [
                ...validateTranslationsConfig({
                    languages: config.languages,
                    settingsLanguage: config.settings?.language,
                    locations
                }),
                ...(await validateTranslationsSourceStorage({
                    absolutePathToFernDirectory: workspace.absoluteFilePath,
                    languages: config.languages,
                    locations
                }))
            ]
        };
    }
};
