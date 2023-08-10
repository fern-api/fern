import { GenerationLanguage } from "@fern-api/generators-configuration";
import { Name, NameAndWireValue, SafeAndUnsafeString } from "@fern-fern/ir-sdk/api";
import { camelCase, snakeCase, upperFirst } from "lodash-es";
import { RESERVED_KEYWORDS } from "./reserved";

export interface CasingsGenerator {
    generateName(name: string): Name;
    generateNameAndWireValue(args: { name: string; wireValue: string }): NameAndWireValue;
}

export function constructCasingsGenerator(generationLanguage: GenerationLanguage | undefined): CasingsGenerator {
    const casingsGenerator: CasingsGenerator = {
        generateName: (name) => {
            const generateSafeAndUnsafeString = (unsafeString: string): SafeAndUnsafeString => ({
                unsafeName: unsafeString,
                safeName: sanitizeNameForLanguage(unsafeString, generationLanguage),
            });

            const camelCaseName = camelCase(name);
            const snakeCaseName = snakeCase(name);

            return {
                originalName: name,
                camelCase: generateSafeAndUnsafeString(camelCaseName),
                snakeCase: generateSafeAndUnsafeString(snakeCaseName),
                screamingSnakeCase: generateSafeAndUnsafeString(snakeCaseName.toUpperCase()),
                pascalCase: generateSafeAndUnsafeString(upperFirst(camelCaseName)),
            };
        },
        generateNameAndWireValue: ({ name, wireValue }) => ({
            name: casingsGenerator.generateName(name),
            wireValue,
        }),
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
    } else {
        return name;
    }
}
