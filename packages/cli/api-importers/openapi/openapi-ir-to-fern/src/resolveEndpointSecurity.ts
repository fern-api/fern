import type { RawSchemas } from "@fern-api/fern-definition-schema";

/** Keep effective OpenAPI requirements explicit when auth is routed per endpoint. */
export function resolveEndpointSecurity(
    operationSecurity: RawSchemas.HttpEndpointSecurity | undefined,
    documentSecurity: RawSchemas.HttpEndpointSecurity | undefined
): RawSchemas.HttpEndpointSecurity | false {
    const security = operationSecurity ?? documentSecurity;
    return security != null && security.length > 0 ? security : false;
}
