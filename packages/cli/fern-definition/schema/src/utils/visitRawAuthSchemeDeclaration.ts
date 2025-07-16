import { assertNever } from "@fern-api/core-utils";

import {
    AuthSchemeDeclarationSchema,
    BasicAuthSchemeSchema,
    BearerAuthSchemeSchema,
    HeaderAuthSchemeSchema
} from "../schemas";
import { OAuthSchemeSchema } from "../schemas";

export interface AuthSchemeDeclarationVisitor<R> {
    header: (authScheme: HeaderAuthSchemeSchema) => R;
    basic: (authScheme: BasicAuthSchemeSchema) => R;
    bearer: (authScheme: BearerAuthSchemeSchema) => R;
    oauth: (authScheme: OAuthSchemeSchema) => R;
}

export function visitRawAuthSchemeDeclaration<R>(
    authScheme: AuthSchemeDeclarationSchema,
    visitor: AuthSchemeDeclarationVisitor<R>
): R {
    if (isHeaderAuthScheme(authScheme)) {
        return visitor.header(authScheme);
    }
    switch (authScheme.scheme) {
        case "basic":
            return visitor.basic(authScheme);
        case "bearer":
            return visitor.bearer(authScheme);
        case "oauth":
            return visitor.oauth(authScheme);
        default:
            assertNever(authScheme);
    }
}

export function isHeaderAuthScheme(authScheme: AuthSchemeDeclarationSchema): authScheme is HeaderAuthSchemeSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (authScheme as HeaderAuthSchemeSchema).header != null;
}
