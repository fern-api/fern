import { z } from "zod";

import { BaseApiSettingsSchema } from "./BaseApiSettingsSchema";
import { DefaultIntegerFormatSchema } from "./DefaultIntegerFormatSchema";
import { FormParameterEncodingSchema } from "./FormParameterEncodingSchema";
import { OpenApiExampleGenerationSchema } from "./OpenApiExampleGenerationSchema";
import { OpenApiFilterSchema } from "./OpenApiFilterSchema";
import { ResolveAliasesSchema } from "./ResolveAliasesSchema";

/**
 * OpenAPI-specific settings that extend the base API settings.
 */
export const OpenApiSettingsSchema: z.ZodObject<
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
        filter: z.ZodOptional<z.ZodObject<{ endpoints: z.ZodOptional<z.ZodArray<z.ZodString>> }, z.core.$strip>>;
        exampleGeneration: z.ZodOptional<
            z.ZodObject<
                {
                    request: z.ZodOptional<z.ZodObject<{ maxDepth: z.ZodOptional<z.ZodNumber> }, z.core.$strip>>;
                    response: z.ZodOptional<z.ZodObject<{ maxDepth: z.ZodOptional<z.ZodNumber> }, z.core.$strip>>;
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
                readonly [z.ZodBoolean, z.ZodObject<{ except: z.ZodOptional<z.ZodArray<z.ZodString>> }, z.core.$strip>]
            >
        >;
        groupMultiApiEnvironments: z.ZodOptional<z.ZodBoolean>;
        defaultIntegerFormat: z.ZodOptional<
            z.ZodEnum<{ int32: "int32"; int64: "int64"; uint32: "uint32"; uint64: "uint64" }>
        >;
    },
    z.core.$strip
> = BaseApiSettingsSchema.extend({
    /** Whether to only include schemas referenced by endpoints in the generated SDK (i.e. a form of tree-shaking). Defaults to false. */
    onlyIncludeReferencedSchemas: z.boolean().optional(),

    /** Whether to include path parameters within the generated in-lined request. Defaults to true. */
    inlinePathParameters: z.boolean().optional(),

    /** Whether to prefer undiscriminated unions with literals. Defaults to false. */
    preferUndiscriminatedUnionsWithLiterals: z.boolean().optional(),

    /** Enables parsing deep object query parameters. */
    objectQueryParameters: z.boolean().optional(),

    /** Enables exploring readonly schemas in OpenAPI specifications. */
    respectReadonlySchemas: z.boolean().optional(),

    /** Enables respecting forward compatible enums in OpenAPI specifications. Defaults to false. */
    respectForwardCompatibleEnums: z.boolean().optional(),

    /** Enables using the `bytes` type for binary responses in OpenAPI specifications. Defaults to a file stream. */
    useBytesForBinaryResponse: z.boolean().optional(),

    /** The default encoding of form parameters. Defaults to JSON. */
    defaultFormParameterEncoding: FormParameterEncodingSchema.optional(),

    /** Filter to apply to the OpenAPI specification. */
    filter: OpenApiFilterSchema.optional(),

    /** Fine-tune your example generation. */
    exampleGeneration: OpenApiExampleGenerationSchema.optional(),

    /** Configure what `additionalProperties` should default to when not explicitly defined on a schema. Defaults to `false`. */
    additionalPropertiesDefaultsTo: z.boolean().optional(),

    /**
     * If true, convert strings with format date to strings.
     * If false, convert strings with format date to dates.
     * Defaults to true.
     */
    typeDatesAsStrings: z.boolean().optional(),

    /**
     * If true, preserve oneOf structures with a single schema.
     * If false, unwrap oneOf structures with a single schema.
     * Defaults to false.
     */
    preserveSingleSchemaOneof: z.boolean().optional(),

    /**
     * Whether to inline allOf schemas. If false, allOf schemas will be
     * extended in the code generation.
     */
    inlineAllOfSchemas: z.boolean().optional(),

    /**
     * Whether to resolve aliases and inline them if possible.
     * If provided, all aliases will be resolved except for the ones in the except array.
     * Defaults to false, meaning that no aliases will be resolved.
     */
    resolveAliases: ResolveAliasesSchema.optional(),

    /**
     * If true, automatically group multiple APIs with matching environments into unified environments with multiple base URLs.
     * This is useful for organizations with multiple APIs deployed to the same set of environments.
     */
    groupMultiApiEnvironments: z.boolean().optional(),

    /**
     * The default format to use for integer types when no format is specified in the OpenAPI schema.
     * Defaults to int32.
     */
    defaultIntegerFormat: DefaultIntegerFormatSchema.optional()
});

export type OpenApiSettingsSchema = z.infer<typeof OpenApiSettingsSchema>;
