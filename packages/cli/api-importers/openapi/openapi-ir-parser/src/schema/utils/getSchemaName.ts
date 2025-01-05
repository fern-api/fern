import { camelCase, upperFirst } from "lodash-es";

import { replaceStartingNumber } from "@fern-api/openapi-ir";

export function getGeneratedTypeName(breadcrumbs: string[], useOriginalSchemaIds: boolean): string {
    const processedTokens = breadcrumbs.map((token) => {
        if (/^[^a-zA-Z0-9]+$/.test(token)) {
            return token;
        } else {
            return upperFirst(camelCase(token));
        }
    });

    const name = processedTokens.join("");

    if (/^\d/.test(name)) {
        return replaceStartingNumber(name) ?? name;
    }
    return name;
}

export function getGeneratedPropertyName(breadcrumbs: string[]): string {
    const underscoreDelimited = breadcrumbs.join("_");
    return camelCase(underscoreDelimited);
}
