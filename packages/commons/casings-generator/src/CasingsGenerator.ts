import { generatorsYml } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Name, NameAndWireValue, SafeAndUnsafeString } from "@fern-api/ir-sdk";
import { camelCase, snakeCase, upperFirst, words } from "lodash-es";

import { RESERVED_KEYWORDS } from "./reserved.js";

export interface CasingsGenerator {
    generateName(
        name: string,
        opts?: { casingOverrides?: RawSchemas.CasingOverridesSchema; preserveUnderscores?: boolean }
    ): Name;
    generateNameAndWireValue(args: {
        name: string;
        wireValue: string;
        opts?: { casingOverrides?: RawSchemas.CasingOverridesSchema; preserveUnderscores?: boolean };
    }): NameAndWireValue;
}

const CAPITALIZE_INITIALISM: generatorsYml.GenerationLanguage[] = ["go", "ruby"];

export function constructCasingsGenerator({
    generationLanguage,
    keywords,
    smartCasing
}: {
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
}): CasingsGenerator {
    const casingsGenerator: CasingsGenerator = {
        generateName: (inputName, opts) => {
            const name = preprocessName(inputName);
            const generateSafeAndUnsafeString = (unsafeString: string): SafeAndUnsafeString => ({
                unsafeName: unsafeString,
                safeName: sanitizeName({
                    name: unsafeString,
                    keywords: getKeywords({ generationLanguage, keywords })
                })
            });

            const preserve = opts?.preserveUnderscores === true;
            const applyCasing = preserve
                ? (n: string, fn: (s: string) => string) => withUnderscorePreservation(n, fn)
                : (_n: string, fn: (s: string) => string) => fn(_n);

            let camelCaseName = applyCasing(name, camelCase);
            let pascalCaseName = preserve
                ? withUnderscorePreservation(name, (n) => upperFirst(camelCase(n)))
                : upperFirst(camelCaseName);
            let snakeCaseName = applyCasing(name, snakeCase);
            const { leading: nameLeading, trailing: nameTrailing } = preserve
                ? extractUnderscoreAffixes(name)
                : { leading: "", trailing: "" };
            const camelCaseWords = words(camelCaseName);
            if (smartCasing) {
                if (
                    !hasAdjacentCommonInitialisms(camelCaseWords) &&
                    (generationLanguage == null || CAPITALIZE_INITIALISM.includes(generationLanguage))
                ) {
                    camelCaseName =
                        nameLeading +
                        camelCaseWords
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
                            .join("") +
                        nameTrailing;
                    pascalCaseName = upperFirst(
                        nameLeading +
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
                                .join("") +
                            nameTrailing
                    );
                }

                // In smartCasing, manage numbers next to letters differently:
                // _.snakeCase("v2") = "v_2"
                // smartCasing("v2") = "v2", other examples: "test2This2 2v22" => "test2this2_2v22", "applicationV1" => "application_v1"
                const smartSnakeFn = (n: string) =>
                    n
                        .split(" ")
                        .map((part) => part.split(/(\d+)/).map(snakeCase).join(""))
                        .join("_");
                snakeCaseName = preserve ? withUnderscorePreservation(name, smartSnakeFn) : smartSnakeFn(name);
            }

            return {
                originalName: inputName,
                camelCase: generateSafeAndUnsafeString(opts?.casingOverrides?.camel ?? camelCaseName),
                snakeCase: generateSafeAndUnsafeString(opts?.casingOverrides?.snake ?? snakeCaseName),
                screamingSnakeCase: generateSafeAndUnsafeString(
                    opts?.casingOverrides?.["screaming-snake"] ?? snakeCaseName.toUpperCase()
                ),
                pascalCase: generateSafeAndUnsafeString(opts?.casingOverrides?.pascal ?? pascalCaseName)
            };
        },
        generateNameAndWireValue: ({ name, wireValue, opts }) => ({
            name: casingsGenerator.generateName(name, opts),
            wireValue
        })
    };
    return casingsGenerator;
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

function getKeywords({
    generationLanguage,
    keywords
}: {
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
}): Set<string> | undefined {
    if (keywords != null) {
        return new Set(keywords);
    }
    if (generationLanguage != null) {
        return RESERVED_KEYWORDS[generationLanguage];
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

// For better casing conventions, define the set of common initialisms.
//
// Ref: https://github.com/golang/lint/blob/6edffad5e6160f5949cdefc81710b2706fbcd4f6/lint.go#L767C1-L809C2
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

// A subset of the COMMON_INITIALISMS that require special handling. We want
// the plural equivalent to be specified with a lowercase trailing 's', such
// as 'APIs' and 'UUIDs'.
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

// Preprocessing replacements applied to names before casing transformations.
// Maps regex patterns to their replacement strings.
const NAME_PREPROCESSOR_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
    [/\[\]/g, "Array"] // e.g., Integer[] -> IntegerArray
];

function preprocessName(name: string): string {
    return NAME_PREPROCESSOR_REPLACEMENTS.reduce(
        (result, [pattern, replacement]) => result.replace(pattern, replacement),
        name
    );
}

/**
 * Extracts leading and trailing underscores from a string.
 * Lodash's camelCase/snakeCase strip these, but they are meaningful
 * (e.g. _internal marks private/protected modules in Python, Ruby, JS).
 */
function extractUnderscoreAffixes(name: string): { leading: string; trailing: string; core: string } {
    const leadingMatch = name.match(/^(_+)/);
    const trailingMatch = name.match(/(_+)$/);
    const leading = leadingMatch?.[1] ?? "";
    const trailing = trailingMatch?.[1] ?? "";
    if (leading.length + trailing.length >= name.length) {
        return { leading: name, trailing: "", core: "" };
    }
    const core = name.slice(leading.length, name.length - trailing.length || undefined);
    return { leading, trailing, core };
}

/**
 * Wraps a casing function to preserve leading and trailing underscores.
 */
function withUnderscorePreservation(name: string, casingFn: (s: string) => string): string {
    const { leading, trailing, core } = extractUnderscoreAffixes(name);
    if (leading === "" && trailing === "") {
        return casingFn(name);
    }
    return `${leading}${casingFn(core)}${trailing}`;
}
