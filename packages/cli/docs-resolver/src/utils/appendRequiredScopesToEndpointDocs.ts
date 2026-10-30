import { FernIr } from "@fern-api/ir-sdk";

const REQUIRED_SCOPES_LABEL = "**Required scopes:**";

/**
 * Appends the scopes declared in each endpoint's `security` requirements to the endpoint's docs,
 * so they render in the endpoint description of the API Reference.
 * Alternative security requirements are joined with "or".
 */
export interface EndpointWithSecurity {
    docs: string | undefined;
    security: FernIr.HttpEndpointSecurityItem[] | undefined;
}

export function appendRequiredScopesToEndpointDocs(ir: {
    services: Record<string, { endpoints: EndpointWithSecurity[] }>;
}): void {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            const scopesLine = getRequiredScopesLine(endpoint.security);
            if (scopesLine == null || endpoint.docs?.includes(REQUIRED_SCOPES_LABEL)) {
                continue;
            }
            endpoint.docs =
                endpoint.docs != null && endpoint.docs.trim().length > 0
                    ? `${endpoint.docs.trimEnd()}\n\n${scopesLine}`
                    : scopesLine;
        }
    }
}

function getRequiredScopesLine(security: FernIr.HttpEndpointSecurityItem[] | undefined): string | undefined {
    if (security == null) {
        return undefined;
    }
    const alternatives = security
        .map((item) => [...new Set(Object.values(item).flat())])
        .filter((scopes) => scopes.length > 0)
        .map((scopes) => scopes.map((scope) => `\`${scope}\``).join(", "));
    const uniqueAlternatives = [...new Set(alternatives)];
    if (uniqueAlternatives.length === 0) {
        return undefined;
    }
    return `${REQUIRED_SCOPES_LABEL} ${uniqueAlternatives.join(" or ")}`;
}
