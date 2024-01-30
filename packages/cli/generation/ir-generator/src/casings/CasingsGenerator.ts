import { GenerationLanguage } from "@fern-api/generators-configuration";
import { Name, NameAndWireValue, SafeAndUnsafeString } from "@fern-fern/ir-sdk/api";
import { camelCase, snakeCase, upperFirst, words } from "lodash-es";
import { RESERVED_KEYWORDS } from "./reserved";

export interface CasingsGenerator {
    generateName(name: string): Name;
    generateNameAndWireValue(args: { name: string; wireValue: string }): NameAndWireValue;
}

export function constructCasingsGenerator(
    generationLanguage: GenerationLanguage | undefined,
    specialCasing: boolean
): CasingsGenerator {
    const casingsGenerator: CasingsGenerator = {
        generateName: (name) => {
            const generateSafeAndUnsafeString = (unsafeString: string): SafeAndUnsafeString => ({
                unsafeName: unsafeString,
                safeName: sanitizeNameForLanguage(unsafeString, generationLanguage)
            });

            let camelCaseName = camelCase(name);
            let pascalCaseName = upperFirst(camelCaseName);
            if (specialCasing) {
                const camelCaseWords = words(camelCaseName);
                camelCaseName = camelCaseWords
                    .map((word, index) => {
                        return index > 0 && isCommonInitialism(word) ? word.toUpperCase() : word;
                    })
                    .join("");
                pascalCaseName = camelCaseWords
                    .map((word, index) => {
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
            const snakeCaseName = snakeCase(camelCaseName);

            return {
                originalName: name,
                camelCase: generateSafeAndUnsafeString(camelCaseName),
                snakeCase: generateSafeAndUnsafeString(snakeCaseName),
                screamingSnakeCase: generateSafeAndUnsafeString(snakeCaseName.toUpperCase()),
                pascalCase: generateSafeAndUnsafeString(pascalCaseName)
            };
        },
        generateNameAndWireValue: ({ name, wireValue }) => ({
            name: casingsGenerator.generateName(name),
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
