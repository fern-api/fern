import { z } from "zod";

import { BaseApiSettingsSchema } from "./BaseApiSettingsSchema";

/**
 * Schema for endpoint filtering in OpenAPI specs.
 * Allows filtering which endpoints are included in the generated SDK.
 */
export const OpenApiFilterSchema = z.object({
    /** Endpoints to include in the generated SDK (e.g. "POST /users"). */
    endpoints: z.array(z.string()).optional()
});

export type OpenApiFilterSchema = z.infer<typeof OpenApiFilterSchema>;

/**
 * Schema for controlling example generation depth.
 */
export const RequestOrResponseExampleGenerationSchema = z.object({
    /** Controls the maximum depth for which optional properties will have examples generated. A depth of 0 means no optional properties will have examples. */
    maxDepth: z.number().optional()
});

export type RequestOrResponseExampleGenerationSchema = z.infer<typeof RequestOrResponseExampleGenerationSchema>;

/**
 * Schema for fine-tuning example generation in OpenAPI specs.
 */
export const OpenApiExampleGenerationSchema = z.object({
    request: RequestOrResponseExampleGenerationSchema.optional(),
    response: RequestOrResponseExampleGenerationSchema.optional()
});

export type OpenApiExampleGenerationSchema = z.infer<typeof OpenApiExampleGenerationSchema>;

/**
 * Schema for controlling alias resolution.
 * Can be a boolean or an object with exceptions.
 */
export const ResolveAliasesSchema = z.union([
    z.boolean(),
    z.object({
        /** Names of alias types to exclude from resolving. */
        except: z.array(z.string()).optional()
    })
]);

export type ResolveAliasesSchema = z.infer<typeof ResolveAliasesSchema>;

/**
 * The default encoding of form parameters.
 */
export const FormParameterEncodingSchema = z.enum(["form", "json"]);

export type FormParameterEncodingSchema = z.infer<typeof FormParameterEncodingSchema>;

/**
 * The default format to use for integer types when no format is specified in the OpenAPI schema.
 */
export const DefaultIntegerFormatSchema = z.enum(["int32", "int64", "uint32", "uint64"]);

export type DefaultIntegerFormatSchema = z.infer<typeof DefaultIntegerFormatSchema>;

/**
 * OpenAPI-specific settings that extend the base API settings.
 * All settings use camelCase naming.
 */
export const OpenApiSettingsSchema = BaseApiSettingsSchema.extend({
    // === Core Schema Handling ===

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

    // === Binary & Encoding ===

    /** Enables using the `bytes` type for binary responses in OpenAPI specifications. Defaults to a file stream. */
    useBytesForBinaryResponse: z.boolean().optional(),

    /** The default encoding of form parameters. Defaults to JSON. */
    defaultFormParameterEncoding: FormParameterEncodingSchema.optional(),

    // === Filtering ===

    /** Filter to apply to the OpenAPI specification. */
    filter: OpenApiFilterSchema.optional(),

    // === Example Generation ===

    /** Fine-tune your example generation. */
    exampleGeneration: OpenApiExampleGenerationSchema.optional(),

    // === Additional Properties ===

    /** Configure what `additionalProperties` should default to when not explicitly defined on a schema. Defaults to `false`. */
    additionalPropertiesDefaultsTo: z.boolean().optional(),

    // === Type Handling ===

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

    // === Multi-API & Environment ===

    /**
     * If true, automatically group multiple APIs with matching environments into unified environments with multiple base URLs.
     * This is useful for organizations with multiple APIs deployed to the same set of environments.
     */
    groupMultiApiEnvironments: z.boolean().optional(),

    // === Integer Format ===

    /**
     * The default format to use for integer types when no format is specified in the OpenAPI schema.
     * Defaults to int32.
     */
    defaultIntegerFormat: DefaultIntegerFormatSchema.optional()
});

export type OpenApiSettingsSchema = z.infer<typeof OpenApiSettingsSchema>;

/**
 * Schema for OpenAPI spec definition in fern.yml.
 */
export const OpenApiSpecSchema = z.object({
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
