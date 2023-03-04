import { z } from "zod";
import { ApiAuthSchema } from "../ApiAuthSchema";
import { AuthSchemeDeclarationSchema } from "../AuthSchemeDeclarationSchema";
import { EnvironmentSchema } from "../EnvironmentSchema";
import { ErrorDiscriminationSchema } from "../ErrorDiscriminationSchema";
import { HttpHeaderSchema } from "../HttpHeaderSchema";

export const RootApiFileSchema = z.strictObject({
    name: z.string(), // TODO: should this be migrated to id?
    "display-name": z.optional(z.string()),
    imports: z.optional(z.record(z.string())),
    auth: z.optional(ApiAuthSchema),
    "auth-schemes": z.optional(z.record(AuthSchemeDeclarationSchema)),
    headers: z.optional(z.record(z.string(), HttpHeaderSchema)),
    "default-environment": z.optional(z.string().or(z.null())),
    environments: z.optional(z.record(z.string(), EnvironmentSchema)),
    "error-discrimination": z.optional(ErrorDiscriminationSchema),
    audiences: z.optional(z.array(z.string())),
    docs: z.optional(z.string()),
    errors: z.optional(z.array(z.string())),
});

export type RootApiFileSchema = z.infer<typeof RootApiFileSchema>;
