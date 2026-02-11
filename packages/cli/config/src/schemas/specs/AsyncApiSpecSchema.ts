import { z } from "zod";

import { AsyncApiSettingsSchema } from "../settings/AsyncApiSettingsSchema";

/**
 * Schema for AsyncAPI spec definition in fern.yml.
 */
export const AsyncApiSpecSchema: z.ZodObject<
    {
        asyncapi: z.ZodString;
        origin: z.ZodOptional<z.ZodString>;
        overrides: z.ZodOptional<z.ZodString>;
        namespace: z.ZodOptional<z.ZodString>;
        settings: z.ZodOptional<
            z.ZodObject<
                {
                    respectNullableSchemas: z.ZodOptional<z.ZodBoolean>;
                    wrapReferencesToNullableInOptional: z.ZodOptional<z.ZodBoolean>;
                    coerceOptionalSchemasToNullable: z.ZodOptional<z.ZodBoolean>;
                    titleAsSchemaName: z.ZodOptional<z.ZodBoolean>;
                    coerceEnumsToLiterals: z.ZodOptional<z.ZodBoolean>;
                    optionalAdditionalProperties: z.ZodOptional<z.ZodBoolean>;
                    idiomaticRequestNames: z.ZodOptional<z.ZodBoolean>;
                    groupEnvironmentsByHost: z.ZodOptional<z.ZodBoolean>;
                    removeDiscriminantsFromSchemas: z.ZodOptional<z.ZodEnum<{ always: "always"; never: "never" }>>;
                    pathParameterOrder: z.ZodOptional<z.ZodEnum<{ urlOrder: "urlOrder"; specOrder: "specOrder" }>>;
                    messageNaming: z.ZodOptional<z.ZodEnum<{ v1: "v1"; v2: "v2" }>>;
                },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
> = z.object({
    /** Path to the AsyncAPI specification file. */
    asyncapi: z.string(),

    /** URL origin for the AsyncAPI spec (for remote specs). */
    origin: z.string().optional(),

    /** Path to overrides file for the AsyncAPI spec. */
    overrides: z.string().optional(),

    /** Namespace for the API (used in multi-API configurations). */
    namespace: z.string().optional(),

    /** AsyncAPI-specific settings. */
    settings: AsyncApiSettingsSchema.optional()
});

export type AsyncApiSpecSchema = z.infer<typeof AsyncApiSpecSchema>;
