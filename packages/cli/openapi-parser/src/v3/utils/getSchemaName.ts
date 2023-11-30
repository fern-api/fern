import { camelCase, upperFirst } from "lodash-es";

export function getGeneratedTypeName(breadcrumbs: string[]): string {
    const underscoreDelimeted = breadcrumbs.join("_");
    return upperFirst(camelCase(underscoreDelimeted));
}

export function getGeneratedPropertyName(breadcrumbs: string[]): string {
    const underscoreDelimeted = breadcrumbs.join("_");
    return camelCase(underscoreDelimeted);
}
