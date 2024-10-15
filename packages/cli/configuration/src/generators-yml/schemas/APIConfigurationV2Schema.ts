import { z } from "zod";
import { RawSchemas } from "@fern-api/fern-definition-schema";

/*********** OpenAPI Spec ***********/

export const OpenAPISettingsSchema = z.strictObject({
    "title-as-schema-name": z.optional(z.boolean()),
    "optional-additional-properties": z.optional(z.boolean()),
    "coerce-enums-to-literals": z.optional(z.boolean())
});

export type OpenAPISettingsSchema = z.infer<typeof OpenAPISettingsSchema>;

export const OpenAPISpecSchema = z.strictObject({
    openapi: z.string(),
    origin: z.string().optional(),
    overrides: z.string().optional(),
    namespace: z.string().optional(),
    settings: z.optional(OpenAPISettingsSchema)
});

export type OpenAPISpecSchema = z.infer<typeof OpenAPISpecSchema>;

/*********** AsyncAPI Spec ***********/

export const AsyncAPISettingsSchema = z.strictObject({
    "title-as-schema-name": z.optional(z.boolean()),
    "optional-additional-properties": z.optional(z.boolean()),
    "coerce-enums-to-literals": z.optional(z.boolean())
});

export type AsyncAPISettingsSchema = z.infer<typeof AsyncAPISettingsSchema>;

export const AsyncAPISchema = z.strictObject({
    asyncapi: z.string(),
    origin: z.string().optional(),
    overrides: z.string().optional(),
    namespace: z.string().optional(),
    settings: z.optional(AsyncAPISettingsSchema)
});

export type AsyncAPISchema = z.infer<typeof AsyncAPISchema>;

/*********** Conjure Spec ***********/

export const ConjureSettingsSchema = z.strictObject({});

export type ConjureSettingsSchema = z.infer<typeof AsyncAPISettingsSchema>;

export const ConjureSchema = z.strictObject({
    conjure: z.string()
});

export type ConjureSchema = z.infer<typeof ConjureSchema>;

/*********** Global Schemas ***********/

export const AsyncAPIOrOpenAPISpecSchema = z.union([OpenAPISpecSchema, AsyncAPISchema]);

export type AsyncAPIOrOpenAPISpecSchema = z.infer<typeof AsyncAPIOrOpenAPISpecSchema>;

export const APIConfigurationV2Schema = z.object({
    auth: z.custom<RawSchemas.ApiAuthSchema>((val) => RawSchemas.serialization.ApiAuthSchema.parseOrThrow(val)),
    // You can't union Conjure specs with OpenAPI and AsyncAPI (drastically inreases complexity)
    specs: z.union([z.array(AsyncAPIOrOpenAPISpecSchema), ConjureSchema]),

    headers: z.custom<Record<string, RawSchemas.HttpHeaderSchema>>((val) =>
        RawSchemas.serialization.WithHeadersSchema.parseOrThrow({ headers: val })
    )

    // environments: z.custom<Record<string, RawSchemas.WithEnvironmentsSchema>>((val) =>
    //     RawSchemas.serialization.WithHeadersSchema.parseOrThrow({ headers: val })
    // )
});
