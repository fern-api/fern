import { camelCase, upperFirst, lowerFirst } from "lodash-es";
import { replaceStartingNumber } from "./replaceStartingNumber";

function customCamelCase(input: string): string {
    const tokens = input.split("_");
    const processedTokens = tokens.map((token, index) => {
        if (/^[a-zA-Z0-9]+$/.test(token)) {
            return index === 0 ? lowerFirst(token) : upperFirst(token);
        }
        return token;
    });
    return processedTokens.join("");
}

export function getGeneratedTypeName(breadcrumbs: string[], useOriginalSchemaIds: boolean): string {
    const camelCaseFn = useOriginalSchemaIds ? customCamelCase : camelCase;
    const underscoreDelimited = breadcrumbs.join("_");
    const name = upperFirst(camelCaseFn(underscoreDelimited));
    if (/^\d/.test(name)) {
        return replaceStartingNumber(name) ?? name;
    }
    return name;
}

export function getGeneratedPropertyName(breadcrumbs: string[]): string {
    const underscoreDelimited = breadcrumbs.join("_");
    return camelCase(underscoreDelimited);
}
