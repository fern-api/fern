import { assertNever } from "@fern-api/core-utils";

import { AnyAuthSchemesSchema, ApiAuthSchema } from "../schemas";
import { AuthSchemeReferenceSchema } from "../schemas";

export interface RawApiAuthVisitor<R> {
    single: (authScheme: AuthSchemeReferenceSchema | string) => R;
    any: (authSchemes: AnyAuthSchemesSchema) => R;
}

export function visitRawApiAuth<R>(apiAuth: ApiAuthSchema, visitor: RawApiAuthVisitor<R>): R {
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
    return typeof apiAuth === "string" || (apiAuth as AuthSchemeReferenceSchema).scheme != null;
}

export function isAnyAuthSchemes(apiAuth: ApiAuthSchema): apiAuth is AnyAuthSchemesSchema {
    const [firstKey, ...rest] = Object.keys(apiAuth);
    return firstKey === "any" && rest.length === 0;
}
