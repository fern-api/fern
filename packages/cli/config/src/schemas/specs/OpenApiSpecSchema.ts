import { z } from "zod";

import { OpenApiSettingsSchema } from "../settings/OpenApiSettingsSchema";

/**
 * Schema for OpenAPI spec definition in fern.yml.
 */
export const OpenApiSpecSchema: z.ZodObject<
    {
        openapi: z.ZodString;
        origin: z.ZodOptional<z.ZodString>;
        overrides: z.ZodOptional<z.ZodString>;
        overlays: z.ZodOptional<z.ZodString>;
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
                    onlyIncludeReferencedSchemas: z.ZodOptional<z.ZodBoolean>;
                    inlinePathParameters: z.ZodOptional<z.ZodBoolean>;
                    preferUndiscriminatedUnionsWithLiterals: z.ZodOptional<z.ZodBoolean>;
                    objectQueryParameters: z.ZodOptional<z.ZodBoolean>;
                    respectReadonlySchemas: z.ZodOptional<z.ZodBoolean>;
                    respectForwardCompatibleEnums: z.ZodOptional<z.ZodBoolean>;
                    useBytesForBinaryResponse: z.ZodOptional<z.ZodBoolean>;
                    defaultFormParameterEncoding: z.ZodOptional<z.ZodEnum<{ form: "form"; json: "json" }>>;
                    filter: z.ZodOptional<
                        z.ZodObject<{ endpoints: z.ZodOptional<z.ZodArray<z.ZodString>> }, z.core.$strip>
                    >;
                    exampleGeneration: z.ZodOptional<
                        z.ZodObject<
                            {
                                request: z.ZodOptional<
                                    z.ZodObject<{ maxDepth: z.ZodOptional<z.ZodNumber> }, z.core.$strip>
                                >;
                                response: z.ZodOptional<
                                    z.ZodObject<{ maxDepth: z.ZodOptional<z.ZodNumber> }, z.core.$strip>
                                >;
                            },
                            z.core.$strip
                        >
                    >;
                    additionalPropertiesDefaultsTo: z.ZodOptional<z.ZodBoolean>;
                    typeDatesAsStrings: z.ZodOptional<z.ZodBoolean>;
                    preserveSingleSchemaOneof: z.ZodOptional<z.ZodBoolean>;
                    inlineAllOfSchemas: z.ZodOptional<z.ZodBoolean>;
                    resolveAliases: z.ZodOptional<
                        z.ZodUnion<
                            readonly [
                                z.ZodBoolean,
                                z.ZodObject<{ except: z.ZodOptional<z.ZodArray<z.ZodString>> }, z.core.$strip>
                            ]
                        >
                    >;
                    groupMultiApiEnvironments: z.ZodOptional<z.ZodBoolean>;
                    defaultIntegerFormat: z.ZodOptional<
                        z.ZodEnum<{ int32: "int32"; int64: "int64"; uint32: "uint32"; uint64: "uint64" }>
                    >;
                },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
> = z.object({
    /** Path to the OpenAPI specification file. */
    openapi: z.string(),

    /** URL origin for the OpenAPI spec (for remote specs). */
    origin: z.string().optional(),

    /** Path to overrides file for the OpenAPI spec. */
    overrides: z.string().optional(),

    /** Path to overlays file for the OpenAPI spec. */
    overlays: z.string().optional(),

    /** Namespace for the API (used in multi-API configurations). */
    namespace: z.string().optional(),

    /** OpenAPI-specific settings. */
    settings: OpenApiSettingsSchema.optional()
});

export type OpenApiSpecSchema = z.infer<typeof OpenApiSpecSchema>;
