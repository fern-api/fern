import { GenerationLanguage } from "@fern-api/generators-configuration";
import { Name, NameAndWireValue, SafeAndUnsafeString } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
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

const CAPITALIZE_INITIALISM: GenerationLanguage[] = ["go", "ruby"];

export function constructCasingsGenerator({
    generationLanguage,
    smartCasing
}: {
    generationLanguage: GenerationLanguage | undefined;
    smartCasing: boolean;
}): CasingsGenerator {
    const casingsGenerator: CasingsGenerator = {
        generateName: (name, opts) => {
            const generateSafeAndUnsafeString = (unsafeString: string): SafeAndUnsafeString => ({
                unsafeName: unsafeString,
                safeName: sanitizeNameForLanguage(unsafeString, generationLanguage)
            });

            let camelCaseName = camelCase(name);
            let pascalCaseName = upperFirst(camelCaseName);
            let snakeCaseName = snakeCase(name);
            const camelCaseWords = words(camelCaseName);
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
                    pascalCaseName = camelCaseWords
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
                        .join("");
                }

                // In smartCasing, manage numbers next to letters differently:
                // _.snakeCase("v2") = "v_2"
                // smartCasing("v2") = "v2", other examples: "test2This2 2v22" => "test2this2_2v22", "applicationV1" => "application_v1"
                snakeCaseName = name
                    .split(" ")
                    .map((part) => part.split(/(\d+)/).map(snakeCase).join(""))
                    .join("_");
            }

            return {
                originalName: name,
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

function sanitizeNameForLanguage(name: string, generationLanguage: GenerationLanguage | undefined): string {
    if (generationLanguage == null) {
        return name;
    }
    const reservedKeywords = RESERVED_KEYWORDS[generationLanguage];
    if (reservedKeywords.has(name)) {
        return name + "_";
    } else if (startsWithNumber(name)) {
        return "_" + name;
    } else {
        return name;
    }
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
    return PLURAL_COMMON_ITIALISMS.get(name.toUpperCase());
}

function isCommonInitialism(name: string): boolean {
    return COMMON_ITIALISMS.has(name.toUpperCase());
}

// For better casing conventions, define the set of common initialisms.
//
// Ref: https://github.com/golang/lint/blob/6edffad5e6160f5949cdefc81710b2706fbcd4f6/lint.go#L767C1-L809C2
const COMMON_ITIALISMS = new Set<string>([
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
    "SLA",
    "SMTP",
    "SQL",
    "SSH",
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
const PLURAL_COMMON_ITIALISMS = new Map<string, string>([
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
