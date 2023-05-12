import { z } from "zod";
import { BasicAuthSchemeSchema } from "./BasicAuthSchemeSchema";
import { BearerAuthSchemeSchema } from "./BearerAuthSchemeSchema";
import { HeaderAuthSchemeSchema } from "./HeaderAuthSchemeSchema";

export const AuthSchemeDeclarationSchema = z.union([
    HeaderAuthSchemeSchema,
    BasicAuthSchemeSchema,
    BearerAuthSchemeSchema,
]);

export type AuthSchemeDeclarationSchema = z.infer<typeof AuthSchemeDeclarationSchema>;
