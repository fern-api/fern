import { z } from "zod";
import { BasicAuthSchemeSchema } from "./BasicAuthSchemeSchema";
import { BearerAuthSchemeSchema } from "./BearerAuthSchemeSchema";
import { HeaderAuthSchemeSchema } from "./HeaderAuthSchemeSchema";
import { OAuthSchemeSchema } from "./OAuthSchemeSchema";

export const AuthSchemeDeclarationSchema = z.union([
    OAuthSchemeSchema,
    HeaderAuthSchemeSchema,
    BasicAuthSchemeSchema,
    BearerAuthSchemeSchema
]);

export type AuthSchemeDeclarationSchema = z.infer<typeof AuthSchemeDeclarationSchema>;
