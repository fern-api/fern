import { z } from "zod";
import { ApiAuthSchema } from "../ApiAuthSchema";
import { AuthSchemeDeclarationSchema } from "../AuthSchemeDeclarationSchema";
import { EnvironmentSchema } from "../EnvironmentSchema";

export const RootApiFileSchema = z.strictObject({
    name: z.string(),
    imports: z.optional(z.record(z.string())),
    auth: z.optional(ApiAuthSchema),
    "auth-schemes": z.optional(z.record(AuthSchemeDeclarationSchema)),
    "default-environment": z.string().or(z.null()),
    environments: z.map(z.string(), EnvironmentSchema),
});

export type RootApiFileSchema = z.infer<typeof RootApiFileSchema>;
