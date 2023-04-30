import { camelCase, upperFirst } from "lodash-es";

export function getSchemaNameFromBreadcrumbs(breadcrumbs: string[]): string {
    if (breadcrumbs.length === 0) {
        throw new Error("Cannot generate name from breadcrumbs");
    }
    const underscoreDelimeted = breadcrumbs.join("_");
    return upperFirst(camelCase(underscoreDelimeted));
}
