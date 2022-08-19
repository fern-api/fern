import { z } from "zod";
import { HeaderAuthSchemeSchema } from "./HeaderAuthSchemeSchema";

export const AuthSchemeDeclarationSchema = HeaderAuthSchemeSchema;

export type AuthSchemeDeclarationSchema = z.infer<typeof AuthSchemeDeclarationSchema>;
