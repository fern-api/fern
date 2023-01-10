import { Name, NameAndWireValue, SafeAndUnsafeString } from "@fern-fern/ir-model/commons";
import { camelCase, snakeCase, upperFirst } from "lodash-es";
import { Language } from "../language";
import { RESERVED_KEYWORDS } from "./reserved";

export interface CasingsGenerator {
    generateName(name: string): Name;
    generateNameAndWireValue(args: { name: string; wireValue: string }): NameAndWireValue;
}

export function constructCasingsGenerator(generationLanguage: Language | undefined): CasingsGenerator {
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

function sanitizeNameForLanguage(name: string, generationLanguage: Language | undefined): string {
    if (generationLanguage == null) {
        return name;
    }
    const reserved_keywords = RESERVED_KEYWORDS[generationLanguage];
    if (reserved_keywords.has(name)) {
        return name + "_";
    } else {
        return name;
    }
}
