import { type docsYml } from "@fern-api/configuration-loader";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function isApiSectionWithInlineSpecs(
    value: Record<string, unknown>
): value is Record<string, unknown> & docsYml.RawSchemas.ApiReferenceConfiguration {
    return typeof value.api === "string" && Array.isArray(value.specs) && value.specs.length > 0;
}

/**
 * Returns every `api` navigation item in docs.yml (at any depth, including tabs, products and
 * versions) that declares its API specs inline via `specs`.
 */
export function getDocsApiSectionsWithInlineSpecs(navigation: unknown): docsYml.RawSchemas.ApiReferenceConfiguration[] {
    if (Array.isArray(navigation)) {
        return navigation.flatMap(getDocsApiSectionsWithInlineSpecs);
    }
    if (!isRecord(navigation)) {
        return [];
    }
    if (isApiSectionWithInlineSpecs(navigation)) {
        return [navigation];
    }
    return Object.values(navigation).flatMap(getDocsApiSectionsWithInlineSpecs);
}
