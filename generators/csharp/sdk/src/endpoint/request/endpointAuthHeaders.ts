import { Writer } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

/**
 * Whether the API applies auth per-endpoint (each endpoint declares its own schemes)
 * rather than applying every configured scheme flatly to every request.
 */
export function isEndpointSecurity(context: SdkGeneratorContext): boolean {
    return context.ir.auth.requirement === "ENDPOINT_SECURITY";
}

/**
 * Builds the C# array-of-arrays literal for an endpoint's static security requirements.
 *
 * `endpoint.security` is a list of requirements (satisfy ANY one of them); each requirement
 * is a map of scheme-key -> scopes where EVERY scheme must be satisfied. Only the scheme keys
 * are needed to route auth headers, so scopes are dropped here.
 *
 * Example: `[{Bearer: []}, {ApiKey: []}]` -> `new[] { new[] { "Bearer" }, new[] { "ApiKey" } }`.
 */
export function getEndpointSecurityLiteral(endpoint: FernIr.HttpEndpoint): string {
    const requirements = endpoint.security ?? [];
    const requirementLiterals = requirements.map((requirement) => {
        const schemeKeys = Object.keys(requirement);
        return `new[] { ${schemeKeys.map((key) => `"${key}"`).join(", ")} }`;
    });
    return `new[] { ${requirementLiterals.join(", ")} }`;
}

/**
 * In endpoint-security mode, emits the `.Add(...)` HeadersBuilder call that routes this
 * endpoint's declared auth scheme(s) into the request headers. The flat client-level
 * `_client.Options.Headers` no longer carries any auth in this mode, so auth is applied
 * here per endpoint. No-op when the API is not in endpoint-security mode or the endpoint
 * declares no security.
 */
export function writeEndpointAuthHeaderAdd({
    writer,
    context,
    endpoint
}: {
    writer: Writer;
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): void {
    if (!isEndpointSecurity(context)) {
        return;
    }
    if (endpoint.security == null || endpoint.security.length === 0) {
        return;
    }
    writer.writeLine();
    writer.write(`.Add(_client.Options.GetAuthHeadersForEndpoint(${getEndpointSecurityLiteral(endpoint)}))`);
}
