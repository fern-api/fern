import { existsSync } from "fs";
import { readdir } from "fs/promises";
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

export function getCanonicalLocale(locale: string): string | undefined {
    try {
        return Intl.getCanonicalLocales(locale)[0];
    } catch {
        return undefined;
    }
}

export function validateTranslationsConfig({
    languages,
    settingsLanguage
}: {
    languages: string[] | undefined;
    settingsLanguage: string | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (languages == null || languages.length === 0) {
        if (settingsLanguage != null) {
            violations.push({
                severity: "fatal",
                message:
                    "`settings.language` is configured, but `languages` is missing. Add `languages` with the source locale as the first entry."
            });
        }
        return violations;
    }

    const canonicalLocaleToEntries = new Map<string, string[]>();

    for (let index = 0; index < languages.length; index++) {
        const locale = languages[index];
        if (locale == null || locale.trim().length === 0) {
            violations.push({
                severity: "fatal",
                message: `languages[${index}] must be a non-empty BCP 47 locale tag.`
            });
            continue;
        }

        const canonicalLocale = getCanonicalLocale(locale);
        if (canonicalLocale == null) {
            violations.push({
                severity: "fatal",
                message: `languages[${index}] is "${locale}", which is not a valid BCP 47 locale tag.`
            });
            continue;
        }

        const existingEntries = canonicalLocaleToEntries.get(canonicalLocale) ?? [];
        existingEntries.push(`languages[${index}] (${locale})`);
        canonicalLocaleToEntries.set(canonicalLocale, existingEntries);

        if (!supportedTranslationLocales.has(canonicalLocale)) {
            violations.push({
                severity: "fatal",
                message: `languages[${index}] is "${locale}", which is not currently supported for docs translations. Supported locales are: ${SUPPORTED_TRANSLATION_LOCALES.join(", ")}.`
            });
        }
    }

    for (const [canonicalLocale, entries] of canonicalLocaleToEntries.entries()) {
        if (entries.length > 1) {
            violations.push({
                severity: "fatal",
                message: `Duplicate translation locale "${canonicalLocale}" configured at ${entries.join(", ")}. Each locale can only appear once.`
            });
        }
    }

    if (settingsLanguage != null && settingsLanguage !== languages[0]) {
        violations.push({
            severity: "fatal",
            message: `settings.language is "${settingsLanguage}", but languages[0] is "${languages[0]}". Fern uses languages[0] as the source/default locale for translations, so set settings.language to "${languages[0]}" or reorder languages so "${settingsLanguage}" is first.`
        });
    }

    return violations;
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
    languages
}: {
    absolutePathToFernDirectory: string;
    languages: string[] | undefined;
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
                    `\n\nAdd fern/translations/${locale}/ or remove "${locale}" from languages.`
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
                    `\n\nAdd "${canonicalLocale}" after languages[0] or remove fern/translations/${entry.name}/.`
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

export const ValidTranslationsConfigRule: Rule = {
    name: "valid-translations-config",
    create: ({ workspace }) => {
        return {
            file: async ({ config }) => [
                ...validateTranslationsConfig({
                    languages: config.languages,
                    settingsLanguage: config.settings?.language
                }),
                ...(await validateTranslationsSourceStorage({
                    absolutePathToFernDirectory: workspace.absoluteFilePath,
                    languages: config.languages
                }))
            ]
        };
    }
};
