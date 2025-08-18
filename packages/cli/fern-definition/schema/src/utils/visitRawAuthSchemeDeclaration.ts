import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "..";
import {
    AuthSchemeDeclarationSchema,
    BasicAuthSchemeSchema,
    HeaderAuthSchemeSchema,
    OAuthSchemeSchema
} from "../schemas";

export interface AuthSchemeDeclarationVisitor<R> {
    header: (authScheme: HeaderAuthSchemeSchema) => R;
    basic: (authScheme: BasicAuthSchemeSchema) => R;
    tokenBearer: (authScheme: RawSchemas.TokenBearerAuthSchema) => R;
    oauth: (authScheme: OAuthSchemeSchema) => R;
    inferredBearer: (authScheme: RawSchemas.InferredBearerAuthSchema) => R;
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
            if ("get-token" in authScheme) {
                return visitor.inferredBearer(authScheme);
            }
            return visitor.tokenBearer(authScheme);
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
