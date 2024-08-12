import { z } from "zod";

/**
 * @example
 * api: openapi.yml
 *
 * @example
 * api: asyncapi.yml
 */
export const APIDefinitionPathSchema = z.string().describe("Path to the OpenAPI, AsyncAPI or Fern Definition");

export const APIDefinitionSettingsSchema = z.object({
    "use-title": z
        .optional(z.boolean())
        .describe(
            "Whether to use the titles of the schemas within an OpenAPI definition as the names of the types within Fern. Defaults to true."
        ),
    unions: z
        .optional(z.enum(["v1"]))
        .describe("What version of union generation to use, this will grow over time. Defaults to v0."),
    "message-naming": z
        .optional(z.enum(["v1", "v2"]))
        .describe(
            "What version of message naming to use for AsyncAPI messages, this will grow over time. Defaults to v1."
        )
});

export type APIDefinitionSettingsSchema = z.infer<typeof APIDefinitionSettingsSchema>;

/**
 * @example
 * api:
 *  path: openapi.yml
 *  overrides: overrides.yml
 *
 * @example
 * api:
 *  path: asyncapi.yml
 *  overrides: overrides.yml
 */
export const APIDefintionWithOverridesSchema = z.object({
    path: APIDefinitionPathSchema,
    // TODO: Add support for pulling the API definition from another github repo
    // and from behind an authed URL. Right now this is for a basic cURL to get the def.
    origin: z
        .optional(z.string())
        .describe("The URL of the API definition origin, from which the file should be polled."),
    overrides: z.optional(z.string()).describe("Path to the OpenAPI or AsyncAPI overrides"),
    audiences: z.optional(z.array(z.string())).describe("Audiences that you would like to filter to"),
    // TODO: Support multiple auth schemes and then allow the user to specify which one(s) to use for this API
    // "auth-scheme": z
    //     .optional(z.string())
    //     .describe("The auth scheme defined within the `auth-schemes` block used for this API."),
    settings: z.optional(APIDefinitionSettingsSchema)
});

/**
 * @example
 * api:
 *  proto:
 *    root: proto
 *    target: proto/user/v1/user.proto
 *    local-generation: true
 */
export const ProtobufDefinitionSchema = z.strictObject({
    root: z.string().describe("The path to the `.proto` directroy root (e.g. `proto`)."),
    target: z
        .string()
        .describe("The path to the target `.proto` file that defines the API (e.g. `proto/user/v1/user.proto`)."),
    overrides: z.optional(z.string()).describe("Path to the overrides configuration"),
    "local-generation": z
        .optional(z.boolean())
        .describe("Whether to compile the `.proto` files locally. By default, we generate remotely.")
});

export type ProtobufDefinitionSchema = z.infer<typeof ProtobufDefinitionSchema>;

/**
 * @example
 * api:
 *  proto:
 *    root: proto
 *    target: proto/user/v1/user.proto
 */
export const ProtobufAPIDefinitionSchema = z.strictObject({
    proto: ProtobufDefinitionSchema
});

export type ProtobufAPIDefinitionSchema = z.infer<typeof ProtobufAPIDefinitionSchema>;

/**
 * @example
 * api:
 *  - path: openapi.yml
 *    overrides: overrides.yml
 *  - openapi.yml
 *  - proto:
 *      root: proto
 *      target: proto/user/v1/user.proto
 */
export const APIDefinitionList = z.array(
    z.union([APIDefinitionPathSchema, APIDefintionWithOverridesSchema, ProtobufAPIDefinitionSchema])
);

export const APIConfigurationSchema = z.union([
    APIDefinitionPathSchema,
    APIDefintionWithOverridesSchema,
    APIDefinitionList,
    ProtobufAPIDefinitionSchema
]);

export type APIConfigurationSchema = z.infer<typeof APIConfigurationSchema>;
