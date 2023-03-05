import { z } from "zod";

export const AuthHeaderSchemeDeclarationSchema = z.strictObject({
    header: z.string(),
    name: z.optional(z.string()),
    type: z.optional(z.string()),
    prefix: z.optional(z.string()),
});

export type AuthHeaderSchemeDeclarationSchema = z.infer<typeof AuthHeaderSchemeDeclarationSchema>;
