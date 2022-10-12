import { z } from "zod";
import { ApiAuthSchema } from "../ApiAuthSchema";
import { AuthSchemeDeclarationSchema } from "../AuthSchemeDeclarationSchema";

export const RootApiFileSchema = z.strictObject({
    name: z.string(),
    imports: z.optional(z.record(z.string())),
    auth: z.optional(ApiAuthSchema),
    "auth-schemes": z.optional(z.record(AuthSchemeDeclarationSchema)),
});

export type RootApiFileSchema = z.infer<typeof RootApiFileSchema>;
