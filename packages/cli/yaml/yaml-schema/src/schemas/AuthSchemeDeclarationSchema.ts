import { z } from "zod";
import { AuthHeaderSchemeDeclarationSchema } from "./AuthHeaderSchemeDeclarationSchema";

export const AuthSchemeDeclarationSchema = AuthHeaderSchemeDeclarationSchema;

export type AuthSchemeDeclarationSchema = z.infer<typeof AuthSchemeDeclarationSchema>;
