/**
 * Sanitizes security requirement objects by replacing null scope values with empty arrays.
 * The OpenAPI spec requires scope values to be string arrays, but some real-world specs
 * use null instead of an empty array for scopes that don't require specific permissions.
 *
 * Duplicated from @fern-api/v3-importer-commons due to circular dependency constraint.
 * Tests live in v3-importer-commons/src/__test__/sanitizeSecurityScopes.test.ts.
 */
export function sanitizeSecurityScopes(
    security: Record<string, unknown>[] | undefined
): Record<string, string[]>[] | undefined {
    if (security == null) {
        return undefined;
    }
    return security.map((requirement) =>
        Object.fromEntries(Object.entries(requirement).map(([key, value]) => [key, value ?? []]))
    ) as Record<string, string[]>[]; // safe: OpenAPI scopes are always string[] or null
}
