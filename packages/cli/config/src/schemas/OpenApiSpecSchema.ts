import { z } from "zod";

// TODO: Fill in the remaining OpenAPI settings. Add a kebab-case -> camelCase preprocessor
//       to seamlessly support the legacy configuration format.
export const OpenApiSettingsSchema = z.object({
    respectReadonlySchemas: z.boolean().optional(),
    onlyIncludeReferencedSchemas: z.boolean().optional(),
    respectNullableSchemas: z.boolean().optional(),
    coerceEnumsToLiterals: z.boolean().optional()
});

export type OpenApiSettingsSchema = z.infer<typeof OpenApiSettingsSchema>;

export const OpenApiSpecSchema = z.object({
    openapi: z.string(),
    origin: z.string().optional(),
    overrides: z.string().optional(),
    overlays: z.string().optional(),
    namespace: z.string().optional(),
    settings: OpenApiSettingsSchema.optional()
});

export type OpenApiSpecSchema = z.infer<typeof OpenApiSpecSchema>;
