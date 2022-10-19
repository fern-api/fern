import { StringWithAllCasings } from "@fern-fern/ir-model/commons";
import { camelCase, snakeCase, upperFirst } from "lodash-es";
import { Language } from "../language";
import { RESERVED_KEYWORDS } from "./reserved";

export function generateNameCasings({
    name,
    generationLanguage,
}: {
    name: string;
    generationLanguage: Language | undefined;
}): StringWithAllCasings {
    const camelCaseName = camelCase(name);
    const snakeCaseName = snakeCase(name);

    return {
        originalValue: name,
        camelCase: sanitizeNameForLanguage(camelCaseName, generationLanguage),
        snakeCase: sanitizeNameForLanguage(snakeCaseName, generationLanguage),
        pascalCase: sanitizeNameForLanguage(upperFirst(camelCaseName), generationLanguage),
        screamingSnakeCase: sanitizeNameForLanguage(snakeCaseName.toUpperCase(), generationLanguage),
    };
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
