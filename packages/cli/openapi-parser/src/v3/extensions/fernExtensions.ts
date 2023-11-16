import { Values } from "@fern-api/core-utils";

export const FernOpenAPIExtension = {
    SDK_METHOD_NAME: "x-fern-sdk-method-name",
    SDK_GROUP_NAME: "x-fern-sdk-group-name",
    REQUEST_NAME_V1: "x-request-name",
    REQUEST_NAME_V2: "x-fern-request-name",
    TYPE_NAME: "x-fern-type-name",
    BOOLEAN_LITERAL: "x-fern-boolean-literal",

    SERVER_NAME_V1: "x-name",
    SERVER_NAME_V2: "x-fern-server-name",

    /**
     * Used to override the type with fern's type syntax
     * Bar:
     *  properties:
     *    createdDate:
     *      type: string
     *      x-fern-type: datetime
     *      x-fern-type:
     *        properties:
     *         a: string
     *         b: integer
     *      x-fern-type: optional<map<string, integer>>
     */
    TYPE_DEFINITION: "x-fern-type",

    /**
     * Used to specify if an endpoint should be generated
     * as a streaming endpoint.
     *
     * Example usage:
     *   paths:
     *     /path/to/my/endpoint:
     *       x-fern-streaming: true
     *
     * Alternatively, you can annotate the endpoint so that
     * it generates both a traditional unary endpoint,
     * as well as its streaming equivalent. The stream
     * condition property is included to specify a boolean
     * propetry that tells the server whether or not the
     * response should be streamed or not.
     *
     * Example usage:
     *   paths:
     *     /path/to/my/endpoint:
     *       x-fern-streaming:
     *         stream-condition: $request.stream
     *         response:
     *           $ref: ./path/to/response/type.yaml
     *         response-stream:
     *           $ref: ./path/to/response-stream/type.yaml
     */
    STREAMING: "x-fern-streaming",

    /**
     * Used to specify if an endpoint is actually
     * representing a webhook
     * Example usage:
     *   paths:
     *     /path/to/my/endpoint:
     *       x-fern-webhook: true
     */
    WEBHOOK: "x-fern-webhook",

    /**
     * Used to detect if an endpoint has an async version of it
     * Example usage:
     *   paths:
     *    /path/to/my/endpoint:
     *      x-fern-async-config:
     *        discriminant:
     *          type: header
     *          name: X-Header-Name
     *          value: async
     *        response-status-code: 202
     **/
    ASYNC_CONFIG: "x-fern-async-config",

    /**
     * Used to create veriables in the fern definition
     * Example usage:
     * x-fern-sdk-variables:
     *   appName:
     *     type: string
     * paths:
     *   /path/to/my/endpoint/{id}:
     *     parameters:
     *       - name: id
     *         in: path
     *         type: string
     *         x-fern-sdk-variable: appName
     */
    SDK_VARIABLES: "x-fern-sdk-variables",
    SDK_VARIABLE: "x-fern-sdk-variable",

    /**
     * securitySchemes:
     *   Basic:
     *     scheme: http
     *     type: basic
     *     x-fern-username-variable-name: clientId
     *     x-fern-password-variable-name: clientSecret
     */
    BASIC_AUTH_USERNAME_VARIABLE_NAME: "x-fern-username-variable-name",
    BASIC_AUTH_PASSWORD_VARIABLE_NAME: "x-fern-password-variable-name",

    /**
     * securitySchemes:
     *   Bearer:
     *     scheme: http
     *     type: bearer
     *     x-fern-token-variable-name: apiKey
     */
    BEARER_TOKEN_VARIABLE_NAME: "x-fern-token-variable-name",

    /**
     * securitySchemes:
     *   Bearer:
     *     type: apiKey
     *     in: header
     *     name: X-API-KEY-ID
     *     x-fern-header-variable-name: apiKeyId
     */
    HEADER_VARIABLE_NAME: "x-fern-header-variable-name",

    /**
     * The x-fern-enum allows you to specify docs for the enum value.
     * If your enum is not codegen friendly (not alphanumeric), then you can specify a codegen name as well.
     *
     * MyEnum:
     *   enum:
     *     - VARIANT_ONE
     *     - VARIANT_TWO
     *   x-fern-enum:
     *     VARIANT_ONE:
     *       description: These are docs about the enum
     *       name: ONE
     */
    FERN_ENUM: "x-fern-enum",

    /**
     * Used to mark operations with audiences
     *
     * paths:
     *   /path/to/my/endpoint/{id}:
     *     x-fern-audiences:
     *       - external
     */
    AUDIENCES: "x-fern-audiences",

    /**
     * Used to tell fern to ignore endpoints.
     *
     * paths:
     *   /path/to/my/endpoint/{id}:
     *     get:
     *       x-fern-ignore: true
     */
    IGNORE: "x-fern-ignore",

    /**
     * paths:
     *  /path/to/my:
     *    get:
     *      x-fern-availability: ga # or beta, generally-available, deprecated,
     */
    AVAILABILITY: "x-fern-availability",
} as const;

export type FernOpenAPIExtension = Values<typeof FernOpenAPIExtension>;
