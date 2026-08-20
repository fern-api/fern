import { z } from "zod";

import { BaseApiSettingsSchema } from "./BaseApiSettingsSchema.js";
import { DefaultIntegerFormatSchema } from "./DefaultIntegerFormatSchema.js";
import { FormParameterEncodingSchema } from "./FormParameterEncodingSchema.js";
import { OpenApiExampleGenerationSchema } from "./OpenApiExampleGenerationSchema.js";
import { OpenApiFilterSchema } from "./OpenApiFilterSchema.js";
import { ResolveAliasesSchema } from "./ResolveAliasesSchema.js";

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

    /** If true, endpoint response types will use the Read variant of schemas when respect-readonly-schemas is enabled. Defaults to false. */
    useReadVariantForResponses: z.boolean().optional(),

    /** Enables respecting forward compatible enums in OpenAPI specifications. Defaults to false. */
    respectForwardCompatibleEnums: z.boolean().optional(),

    /** Deprecated and no longer has any effect. A request body that OpenAPI does not mark as required is always described as omittable in the IR, and each SDK generator opts into that behaviour through its own configuration. */
    respectOptionalRequestBody: z.boolean().optional(),

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
     * If true, an allOf containing a oneOf/anyOf member is distributed into a union, where each
     * variant is the union member merged with the remaining allOf members.
     * If false, the variants' properties are flattened into a single object and marked optional.
     * Defaults to false.
     */
    preserveOneOfInAllOf: z.boolean().optional(),

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
    defaultIntegerFormat: DefaultIntegerFormatSchema.optional(),

    /**
     * If true, properties shared by every variant of a discriminated `oneOf`
     * (including via `allOf`/`$ref`) are lifted into the union's base properties
     * so SDKs can expose them directly on the union type without casting.
     * Defaults to false.
     */
    inferDiscriminatedUnionBaseProperties: z.boolean().optional(),

    /**
     * If true, disambiguate generated request wrapper names that collide with
     * component schema names by replacing the "Request" suffix with "Body".
     * If false, keep the original "Request" suffix regardless of collisions.
     * Defaults to true.
     */
    "disambiguate-request-names": z.boolean().optional(),

    /**
     * If true, ignore operation-level tags when determining the SDK structure.
     * Endpoints fall back to the root package (or their namespace) and method
     * names are derived from each operation's operationId.
     * Defaults to false.
     */
    "ignore-tags": z.boolean().optional(),

    /**
     * If true, header parameters that declare their schema under `content` (e.g. a header
     * whose value is a JSON-encoded object) are typed from that schema instead of falling
     * back to a string.
     * Defaults to false.
     */
    "respect-parameter-content": z.boolean().optional()
});

export type OpenApiSettingsSchema = z.infer<typeof OpenApiSettingsSchema>;
