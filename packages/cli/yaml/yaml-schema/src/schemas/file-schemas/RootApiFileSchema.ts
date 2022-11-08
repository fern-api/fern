import { z } from "zod";
import { ApiAuthSchema } from "../ApiAuthSchema";
import { AuthSchemeDeclarationSchema } from "../AuthSchemeDeclarationSchema";
import { EnvironmentSchema } from "../EnvironmentSchema";
import { HttpHeaderSchema } from "../HttpHeaderSchema";

export const RootApiFileSchema = z.strictObject({
    name: z.string(),
    imports: z.optional(z.record(z.string())),
    auth: z.optional(ApiAuthSchema),
    "auth-schemes": z.optional(z.record(AuthSchemeDeclarationSchema)),
    headers: z.optional(z.record(z.string(), HttpHeaderSchema)),
    "default-environment": z.optional(z.string().or(z.null())),
    environments: z.optional(z.record(z.string(), EnvironmentSchema)),
    "error-discriminant": z.string().optional(),
});

export type RootApiFileSchema = z.infer<typeof RootApiFileSchema>;
