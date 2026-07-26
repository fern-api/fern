import { capBreadcrumbToken } from "@fern-api/core-utils";
import { replaceStartingNumber } from "@fern-api/openapi-ir";
import { camelCase, upperFirst } from "lodash-es";

export function getGeneratedTypeName(breadcrumbs: string[], useOriginalSchemaIds: boolean): string {
    const processedTokens = breadcrumbs.map((rawToken) => {
        const token = capBreadcrumbToken(rawToken);
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
