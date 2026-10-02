import { assertNever } from "@fern-api/core-utils";
import {
    AnyAuthSchemesSchema,
    ApiAuthSchema,
    AuthSchemeReferenceSchema,
    EndpointSecuritySchema
} from "../schemas/index.js";

export interface RawApiAuthVisitor<R> {
    single: (authScheme: AuthSchemeReferenceSchema | string) => R;
    any: (authSchemes: AnyAuthSchemesSchema) => R;
    endpointSecurity: (authSchemes: EndpointSecuritySchema) => R;
}

export function visitRawApiAuth<R>(apiAuth: ApiAuthSchema, visitor: RawApiAuthVisitor<R>): R {
    if (isEndpointSecurityAuthSchemes(apiAuth)) {
        return visitor.endpointSecurity(typeof apiAuth === "string" ? { "endpoint-security": {} } : apiAuth);
    }
    if (isSingleAuthScheme(apiAuth)) {
        return visitor.single(apiAuth);
    }
    if (isAnyAuthSchemes(apiAuth)) {
        return visitor.any(apiAuth);
    }
    assertNever(apiAuth);
}

export function isSingleAuthScheme(apiAuth: ApiAuthSchema): apiAuth is AuthSchemeReferenceSchema | string {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (
        (typeof apiAuth === "string" && apiAuth !== "endpoint-security") ||
        (apiAuth as AuthSchemeReferenceSchema).scheme != null
    );
}

export function isAnyAuthSchemes(apiAuth: ApiAuthSchema): apiAuth is AnyAuthSchemesSchema {
    const [firstKey, ...rest] = Object.keys(apiAuth);
    return firstKey === "any" && rest.length === 0;
}

export function isEndpointSecurityAuthSchemes(
    apiAuth: ApiAuthSchema
): apiAuth is EndpointSecuritySchema | "endpoint-security" {
    if (typeof apiAuth === "string") {
        return apiAuth === "endpoint-security";
    }
    const [firstKey, ...rest] = Object.keys(apiAuth);
    return firstKey === "endpoint-security" && rest.length === 0;
}
