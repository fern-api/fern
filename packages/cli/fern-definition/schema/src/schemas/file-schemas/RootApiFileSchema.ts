import { z } from "zod";
import { ApiAuthSchema } from "../ApiAuthSchema";
import { AuthSchemeDeclarationSchema } from "../AuthSchemeDeclarationSchema";
import { EnvironmentSchema } from "../EnvironmentSchema";
import { ErrorDiscriminationSchema } from "../ErrorDiscriminationSchema";
import { HttpHeaderSchema } from "../HttpHeaderSchema";
import { HttpPathParameterSchema } from "../HttpPathParameterSchema";
import { PaginationSchema } from "../PaginationSchema";
import { VariableDeclarationSchema } from "../VariableDeclarationSchema";
import { VersionDeclarationSchema } from "../VersionDeclarationSchema";
import { WithDisplayNameSchema } from "../WithDisplayNameSchema";

export const WithEnvironmentsSchema = z.strictObject({
    "default-url": z.optional(z.string()),
    "default-environment": z.optional(z.string().or(z.null())),
    environments: z.optional(z.record(z.string(), EnvironmentSchema))
});

export type WithEnvironmentsSchema = z.infer<typeof WithEnvironmentsSchema>;

export const WithAuthSchema = z.strictObject({
    auth: z.optional(ApiAuthSchema),
    "auth-schemes": z.optional(z.record(AuthSchemeDeclarationSchema))
});

export type WithAuthSchema = z.infer<typeof WithAuthSchema>;

export const WithHeadersSchema = z.strictObject({
    headers: z.optional(z.record(z.string(), HttpHeaderSchema))
});

export type WithHeadersSchema = z.infer<typeof WithHeadersSchema>;

export const RootApiFileSchema = z
    .strictObject({
        name: z.string(), // TODO: should this be migrated to id?
        imports: z.optional(z.record(z.string())),
        "error-discrimination": z.optional(ErrorDiscriminationSchema),
        audiences: z.optional(z.array(z.string())),
        docs: z.optional(z.string()),
        errors: z.optional(z.array(z.string())),
        "base-path": z.optional(z.string()),
        "path-parameters": z.optional(z.record(HttpPathParameterSchema)),
        "idempotency-headers": z.optional(z.record(z.string(), HttpHeaderSchema)),
        variables: z.optional(z.record(VariableDeclarationSchema)),
        pagination: z.optional(PaginationSchema),
        version: z.optional(VersionDeclarationSchema)
    })
    .extend(WithEnvironmentsSchema.shape)
    .extend(WithAuthSchema.shape)
    .extend(WithDisplayNameSchema.shape)
    .extend(WithHeadersSchema.shape);

export type RootApiFileSchema = z.infer<typeof RootApiFileSchema>;
