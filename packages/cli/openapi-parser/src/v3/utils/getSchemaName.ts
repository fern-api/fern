import { camelCase, upperFirst } from "lodash-es";

export function getGeneratedTypeName(breadcrumbs: string[]): string {
    // if (breadcrumbs.length === 0) {
    //     throw new Error("Cannot generate name from breadcrumbs");
    // }
    const underscoreDelimeted = breadcrumbs.join("_");
    return upperFirst(camelCase(underscoreDelimeted));
}

export function getGeneratedPropertyName(breadcrumbs: string[]): string {
    // if (breadcrumbs.length === 0) {
    //     throw new Error("Cannot generate name from breadcrumbs");
    // }
    const underscoreDelimeted = breadcrumbs.join("_");
    return camelCase(underscoreDelimeted);
}
