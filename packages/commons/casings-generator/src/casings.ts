import { generatorsYml } from "@fern-api/configuration";
import { camelCase, snakeCase, upperFirst, words } from "lodash-es";

import { RESERVED_KEYWORDS } from "./reserved";

const CAPITALIZE_INITIALISM: generatorsYml.GenerationLanguage[] = ["go", "ruby"];

export interface CasingOptions {
    generationLanguage?: generatorsYml.GenerationLanguage;
    keywords?: string[];
    smartCasing?: boolean;
}

export interface SafeAndUnsafe {
    safeName: string;
    unsafeName: string;
}

export function toCamelCase(str: string, options?: CasingOptions): SafeAndUnsafe {
    const name = preprocessName(str);
    let camelCaseName = camelCase(name);
    const camelCaseWords = words(camelCaseName);

    if (options?.smartCasing) {
        if (
            !hasAdjacentCommonInitialisms(camelCaseWords) &&
            (options.generationLanguage == null || CAPITALIZE_INITIALISM.includes(options.generationLanguage))
        ) {
            camelCaseName = camelCaseWords
                .map((word, index) => {
                    if (index > 0) {
                        const pluralInitialism = maybeGetPluralInitialism(word);
                        if (pluralInitialism != null) {
                            return pluralInitialism;
                        }
                        if (isCommonInitialism(word)) {
                            return word.toUpperCase();
                        }
                    }
                    return word;
                })
                .join("");
        }
    }

    return {
        unsafeName: camelCaseName,
        safeName: sanitizeName({
            name: camelCaseName,
            keywords: getKeywords(options)
        })
    };
}

export function toPascalCase(str: string, options?: CasingOptions): SafeAndUnsafe {
    const name = preprocessName(str);
    let camelCaseName = camelCase(name);
    let pascalCaseName = upperFirst(camelCaseName);
    const camelCaseWords = words(camelCaseName);

    if (options?.smartCasing) {
        if (
            !hasAdjacentCommonInitialisms(camelCaseWords) &&
            (options.generationLanguage == null || CAPITALIZE_INITIALISM.includes(options.generationLanguage))
        ) {
            pascalCaseName = upperFirst(
                camelCaseWords
                    .map((word, index) => {
                        const pluralInitialism = maybeGetPluralInitialism(word);
                        if (pluralInitialism != null) {
                            return pluralInitialism;
                        }
                        if (isCommonInitialism(word)) {
                            return word.toUpperCase();
                        }
                        if (index === 0) {
                            return upperFirst(word);
                        }
                        return word;
                    })
                    .join("")
            );
        }
    }

    return {
        unsafeName: pascalCaseName,
        safeName: sanitizeName({
            name: pascalCaseName,
            keywords: getKeywords(options)
        })
    };
}

export function toSnakeCase(str: string, options?: CasingOptions): SafeAndUnsafe {
    const name = preprocessName(str);
    let snakeCaseName = snakeCase(name);

    if (options?.smartCasing) {
        snakeCaseName = name
            .split(" ")
            .map((part) => part.split(/(\d+)/).map(snakeCase).join(""))
            .join("_");
    }

    return {
        unsafeName: snakeCaseName,
        safeName: sanitizeName({
            name: snakeCaseName,
            keywords: getKeywords(options)
        })
    };
}

export function toScreamingSnakeCase(str: string, options?: CasingOptions): SafeAndUnsafe {
    const snakeCaseResult = toSnakeCase(str, options);
    return {
        unsafeName: snakeCaseResult.unsafeName.toUpperCase(),
        safeName: sanitizeName({
            name: snakeCaseResult.unsafeName.toUpperCase(),
            keywords: getKeywords(options)
        })
    };
}

function sanitizeName({ name, keywords }: { name: string; keywords: Set<string> | undefined }): string {
    if (keywords == null) {
        return name;
    }
    if (keywords.has(name)) {
        return name + "_";
    } else if (startsWithNumber(name)) {
        return "_" + name;
    } else {
        return name;
    }
}

function getKeywords(options?: CasingOptions): Set<string> | undefined {
    if (options?.keywords != null) {
        return new Set(options.keywords);
    }
    if (options?.generationLanguage != null) {
        return RESERVED_KEYWORDS[options.generationLanguage];
    }
    return undefined;
}

const STARTS_WITH_NUMBER = /^[0-9]/;
function startsWithNumber(str: string): boolean {
    return STARTS_WITH_NUMBER.test(str);
}

function hasAdjacentCommonInitialisms(wordList: string[]): boolean {
    return wordList.some((word, index) => {
        if (index === 0) {
            return false;
        }
        const previousWord = wordList[index - 1];
        if (previousWord == null) {
            return false;
        }
        const previousWordIsInitialism =
            maybeGetPluralInitialism(previousWord) != null || isCommonInitialism(previousWord);
        const currentWordIsInitialism = maybeGetPluralInitialism(word) != null || isCommonInitialism(word);
        return previousWordIsInitialism && currentWordIsInitialism;
    });
}

function maybeGetPluralInitialism(name: string): string | undefined {
    return PLURAL_COMMON_INITIALISMS.get(name.toUpperCase());
}

function isCommonInitialism(name: string): boolean {
    return COMMON_INITIALISMS.has(name.toUpperCase());
}

const COMMON_INITIALISMS = new Set<string>([
    "ACL",
    "API",
    "ASCII",
    "CPU",
    "CSS",
    "DNS",
    "EOF",
    "GUID",
    "HTML",
    "HTTP",
    "HTTPS",
    "ID",
    "IP",
    "JSON",
    "LHS",
    "QPS",
    "RAM",
    "RHS",
    "RPC",
    "SAML",
    "SCIM",
    "SLA",
    "SMTP",
    "SQL",
    "SSH",
    "SSO",
    "TCP",
    "TLS",
    "TTL",
    "UDP",
    "UI",
    "UID",
    "UUID",
    "URI",
    "URL",
    "UTF8",
    "VM",
    "XML",
    "XMPP",
    "XSRF",
    "XSS"
]);

const PLURAL_COMMON_INITIALISMS = new Map<string, string>([
    ["ACLS", "ACLs"],
    ["APIS", "APIs"],
    ["CPUS", "CPUs"],
    ["GUIDS", "GUIDs"],
    ["IDS", "IDs"],
    ["UIDS", "UIDs"],
    ["UUIDS", "UUIDs"],
    ["URIS", "URIs"],
    ["URLS", "URLs"]
]);

const NAME_PREPROCESSOR_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [[/\[\]/g, "Array"]];

function preprocessName(name: string): string {
    return NAME_PREPROCESSOR_REPLACEMENTS.reduce(
        (result, [pattern, replacement]) => result.replace(pattern, replacement),
        name
    );
}
