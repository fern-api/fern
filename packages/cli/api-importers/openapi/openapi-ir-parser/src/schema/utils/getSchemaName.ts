import { camelCase, upperFirst } from "lodash-es";
import { replaceStartingNumber } from "./replaceStartingNumber";

export function getGeneratedTypeName(breadcrumbs: string[]): string {
    const underscoreDelimeted = breadcrumbs.join("_");
    const name = upperFirst(camelCase(underscoreDelimeted));
    if (/^\d/.test(name)) {
        return replaceStartingNumber(name) ?? name;
    }
    return name;
}

export function getGeneratedPropertyName(breadcrumbs: string[]): string {
    const underscoreDelimeted = breadcrumbs.join("_");
    return camelCase(underscoreDelimeted);
}
