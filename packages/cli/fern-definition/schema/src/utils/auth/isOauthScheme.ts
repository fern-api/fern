import { AuthSchemeDeclarationSchema, OAuthSchemeSchema } from "../../schemas/index.js";

export function isOAuthScheme(
    rawOAuthSchemeSchema: AuthSchemeDeclarationSchema
): rawOAuthSchemeSchema is OAuthSchemeSchema {
    return (rawOAuthSchemeSchema as OAuthSchemeSchema).scheme === "oauth";
}
