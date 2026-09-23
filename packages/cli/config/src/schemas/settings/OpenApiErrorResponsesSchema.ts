import { z } from "zod";

export const OpenApiErrorResponsesHttpMethodSchema = z.enum([
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
    "options",
    "trace"
]);

export type OpenApiErrorResponsesHttpMethodSchema = z.infer<typeof OpenApiErrorResponsesHttpMethodSchema>;

export const OpenApiErrorResponsesEnsureSchema = z.object({
    /** The 4xx/5xx status code to add when an operation does not declare it. */
    statusCode: z.number().int().min(400).max(599),

    /** HTTP methods whose operations receive the response. Defaults to all methods. */
    methods: z.array(OpenApiErrorResponsesHttpMethodSchema).optional()
});

export type OpenApiErrorResponsesEnsureSchema = z.infer<typeof OpenApiErrorResponsesEnsureSchema>;

/**
 * Standardizes every 4xx/5xx response body on a single schema (e.g. RFC 9457 Problem Details).
 */
export const OpenApiErrorResponsesSchema = z.object({
    /**
     * The OpenAPI schema used for error response bodies: either a path to a YAML/JSON file
     * (relative to fern.yml) or an inline schema object. Any `$ref` inside it must be a local
     * `#/components/...` pointer into the OpenAPI spec it is applied to.
     */
    schema: z.union([z.string(), z.record(z.string(), z.unknown())]),

    /**
     * Name of the generated error body type. Defaults to the schema's `title`, then `ProblemDetails`.
     * A different pre-existing schema of the same name is replaced if nothing references it once
     * the error responses have been rewritten; otherwise `fern check` fails.
     */
    name: z.string().optional(),

    /**
     * `all` replaces the body of every 4xx/5xx response; `untyped` only fills in responses that
     * declare no body schema. Defaults to `all`.
     */
    applyTo: z.enum(["all", "untyped"]).optional(),

    /** Error responses to add to operations that do not already declare them. */
    ensure: z.array(OpenApiErrorResponsesEnsureSchema).optional()
});

export type OpenApiErrorResponsesSchema = z.infer<typeof OpenApiErrorResponsesSchema>;
