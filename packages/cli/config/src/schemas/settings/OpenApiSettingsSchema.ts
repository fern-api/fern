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
export const OpenApiSettingsSchema = BaseApiSettingsSchema.extend({
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
