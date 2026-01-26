// TODO: Restructure these settings and make them camelCase. Use the zod processor.
import { z } from "zod";

/**
 * Controls when to remove discriminant properties from schemas.
 */
export const RemoveDiscriminantsFromSchemasSchema = z.enum(["always", "never"]);

export type RemoveDiscriminantsFromSchemasSchema = z.infer<typeof RemoveDiscriminantsFromSchemasSchema>;

/**
 * Controls the order of path parameters in generated method signatures.
 */
export const PathParameterOrderSchema = z.enum(["url-order", "spec-order"]);

export type PathParameterOrderSchema = z.infer<typeof PathParameterOrderSchema>;

/**
 * Base API settings that are common across OpenAPI, AsyncAPI, and other API specs.
 * All settings use camelCase naming for v2 configuration format.
 */
export const BaseApiSettingsSchema = z.object({
    // === Nullable Schema Handling ===

    /** Preserves nullable schemas in API definition settings. Defaults to true, where nullable schemas are treated as optional. */
    respectNullableSchemas: z.boolean().optional(),

    /**
     * If true, the converter will convert nullable schemas to optional nullable.
     * If false, the converter will convert nullable schemas to required nullable.
     * Defaults to true.
     */
    wrapReferencesToNullableInOptional: z.boolean().optional(),

    /**
     * If true, the converter will coerce nullable schemas to optional.
     * If false, the converter will keep nullable schemas as nullable.
     * Defaults to true.
     */
    coerceOptionalSchemasToNullable: z.boolean().optional(),

    // === Schema Naming ===

    /** Whether to use the titles of the schemas within an OpenAPI definition as the names of the types within Fern. Defaults to false. */
    titleAsSchemaName: z.boolean().optional(),

    /** Whether to coerce single value enums to literals. Defaults to true. */
    coerceEnumsToLiterals: z.boolean().optional(),

    // === Additional Properties ===

    /** Controls how optional additional properties are handled. */
    optionalAdditionalProperties: z.boolean().optional(),

    // === Request Handling ===

    /** Whether to use idiomatic request naming conventions. */
    idiomaticRequestNames: z.boolean().optional(),

    // === Environment Handling ===

    /**
     * If true, group servers by host into unified environments regardless of protocol.
     * This allows APIs with multiple protocols (REST, WebSocket, etc.) to share environment configuration.
     * When enabled, environment URL IDs are generated with collision resolution:
     * - Use server name alone if no collision
     * - Add path segment if collision (e.g., "prod: https://api.com/foo" -> "foo")
     * - Add protocol if still collision (e.g., "prod: wss://api.com/foo" -> "foo_wss", only for non-HTTPS protocols)
     */
    groupEnvironmentsByHost: z.boolean().optional(),

    // === Discriminant Handling ===

    /**
     * If `always`, remove discriminant properties from schemas when generating types, unless the schema is also used outside of a discriminated union.
     * If `never`, keep discriminant properties in schemas when generating types.
     * Defaults to `always`.
     */
    removeDiscriminantsFromSchemas: RemoveDiscriminantsFromSchemasSchema.optional(),

    // === Path Parameter Handling ===

    /**
     * Controls the order of path parameters in generated method signatures.
     * - `url-order`: Use the order path parameters appear in the URL path (e.g., /users/{userId}/posts/{postId})
     * - `spec-order`: Use the order path parameters are defined in the spec
     * Defaults to `url-order`.
     */
    pathParameterOrder: PathParameterOrderSchema.optional()
});

export type BaseApiSettingsSchema = z.infer<typeof BaseApiSettingsSchema>;
