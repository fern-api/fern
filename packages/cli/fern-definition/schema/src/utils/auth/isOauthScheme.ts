import { AuthSchemeDeclarationSchema, OAuthSchemeSchema } from "../../schemas";

export function isOAuthScheme(
    rawOAuthSchemeSchema: AuthSchemeDeclarationSchema
): rawOAuthSchemeSchema is OAuthSchemeSchema {
    return (rawOAuthSchemeSchema as OAuthSchemeSchema).scheme === "oauth";
}
