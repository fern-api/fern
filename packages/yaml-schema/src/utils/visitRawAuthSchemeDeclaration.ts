import { assertNever } from "@fern-api/core-utils";
import { AuthSchemeDeclarationSchema, HeaderAuthSchemeSchema } from "../schemas";

export interface AuthSchemeDeclarationVisitor<R> {
    header: (authScheme: HeaderAuthSchemeSchema) => R;
}

export function visitRawAuthSchemeDeclaration<R>(
    authScheme: AuthSchemeDeclarationSchema,
    visitor: AuthSchemeDeclarationVisitor<R>
): R {
    if (isHeaderAuthScheme(authScheme)) {
        return visitor.header(authScheme);
    }
    assertNever(authScheme);
}

export function isHeaderAuthScheme(authScheme: AuthSchemeDeclarationSchema): authScheme is HeaderAuthSchemeSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (authScheme as HeaderAuthSchemeSchema).header != null;
}
