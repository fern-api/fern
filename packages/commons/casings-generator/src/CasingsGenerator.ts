import { generatorsYml } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Name, NameAndWireValue, SafeAndUnsafeString } from "@fern-api/ir-sdk";
import { camelCase, snakeCase, upperFirst, words } from "lodash-es";

import { RESERVED_KEYWORDS } from "./reserved";

export interface CasingsGenerator {
    generateName(name: string, opts?: { casingOverrides?: RawSchemas.CasingOverridesSchema }): Name;
    generateNameAndWireValue(args: {
        name: string;
        wireValue: string;
        opts?: { casingOverrides?: RawSchemas.CasingOverridesSchema };
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
        generateName: (name, opts) => {
            const generateSafeAndUnsafeString = (unsafeString: string): SafeAndUnsafeString => ({
                unsafeName: unsafeString,
                safeName: sanitizeName({
                    name: unsafeString,
                    keywords: getKeywords({ generationLanguage, keywords })
                })
            });

            const naiveCamelCaseName = camelCase(name);
            const naivePascalCaseName = upperFirst(naiveCamelCaseName);
            const naiveSnakeCaseName = snakeCase(name);
            const naiveScreamingSnakeCaseName = naiveSnakeCaseName.toUpperCase();

            let camelCaseName = naiveCamelCaseName;
            let pascalCaseName = naivePascalCaseName;
            let snakeCaseName = naiveSnakeCaseName;

            const camelCaseWords = words(naiveCamelCaseName);
            if (smartCasing) {
                if (
                    !hasAdjacentCommonInitialisms(camelCaseWords) &&
                    (generationLanguage == null || CAPITALIZE_INITIALISM.includes(generationLanguage))
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

                // In smartCasing, manage numbers next to letters differently:
                // _.snakeCase("v2") = "v_2"
                // smartCasing("v2") = "v2", other examples: "test2This2 2v22" => "test2this2_2v22", "applicationV1" => "application_v1"
                snakeCaseName = name
                    .split(" ")
                    .map((part) => part.split(/(\d+)/).map(snakeCase).join(""))
                    .join("_");
            }

            const finalCamelCaseName = generateSafeAndUnsafeString(opts?.casingOverrides?.camel ?? camelCaseName);
            const finalPascalCaseName = generateSafeAndUnsafeString(opts?.casingOverrides?.pascal ?? pascalCaseName);
            const finalSnakeCaseName = generateSafeAndUnsafeString(opts?.casingOverrides?.snake ?? snakeCaseName);
            const finalScreamingSnakeCaseName = generateSafeAndUnsafeString(
                opts?.casingOverrides?.["screaming-snake"] ?? snakeCaseName.toUpperCase()
            );

            if (
                finalCamelCaseName.safeName === naiveCamelCaseName &&
                finalPascalCaseName.safeName === naivePascalCaseName &&
                finalSnakeCaseName.safeName === naiveSnakeCaseName &&
                finalScreamingSnakeCaseName.safeName === naiveScreamingSnakeCaseName
            ) {
                // If all the variations are trivially derivable, simply return the original name
                return name;
            }

            // Otherwise, return the name cased as needed
            return {
                originalName: name,
                camelCase: finalCamelCaseName.safeName === naiveCamelCaseName ? undefined : finalCamelCaseName,
                pascalCase: finalPascalCaseName.safeName === naivePascalCaseName ? undefined : finalPascalCaseName,
                snakeCase: finalSnakeCaseName.safeName === naiveSnakeCaseName ? undefined : finalSnakeCaseName,
                screamingSnakeCase:
                    finalScreamingSnakeCaseName.safeName === naiveScreamingSnakeCaseName
                        ? undefined
                        : finalScreamingSnakeCaseName
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
