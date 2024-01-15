import { camelCase, upperFirst } from "lodash-es";

export function getGeneratedTypeName(breadcrumbs: string[]): string {
    const underscoreDelimeted = breadcrumbs.join("_");
    return prependFernIfStartWithNumber(upperFirst(camelCase(underscoreDelimeted)));
}

export function getGeneratedPropertyName(breadcrumbs: string[]): string {
    const underscoreDelimeted = breadcrumbs.join("_");
    return camelCase(underscoreDelimeted);
}

export function prependFernIfStartWithNumber(name: string): string {
    if (/^\d/.test(name)) {
        return "Fern" + name;
    }
    return name;
}