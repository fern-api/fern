import { Values } from "@fern-api/core-utils";

export const FernAsyncAPIExtension = {
    /**
     * The x-fern-optional allows you to specify that a channel parameter is optional.
     *
     * parameters:
     *   MyChannelParam:
     *     description: This is a description of the parameter
     *     x-fern-optional: true
     */
    FERN_PARAMETER_OPTIONAL: "x-fern-optional",

    /**
     * The x-fern-address allows you to specify the address for the websocket channel.
     * Used in v2.x.x specs to specify the address for a websocket channel when the channel
     * name is not the same as the address.
     *
     * channels:
     *   /my-channel:
     *     x-fern-address: /get-user
     */
    FERN_CHANNEL_ADDRESS: "x-fern-address",

    /**
     * The x-fern-summary allows you to specify a display name for the websocket channel.
     */
    FERN_DISPLAY_NAME: "x-fern-display-name",

    /**
     * The x-fern-sdk-group-name allows you to specify the SDK group name for the websocket channel.
     */
    FERN_SDK_GROUP_NAME: "x-fern-sdk-group-name",

    /**
     * The x-fern-examples allows you to specify examples for the websocket session.
     *
     * channels:
     *   /my-channel:
     *      subscribe:
     *        ...
     *
     *      x-fern-examples:
     *       - name: example-1
     *         summary: This is an example of a websocket session
     *         description: This is a description of the example
     *         messages:
     *           - type: publish
     *             messageId: SendMessage
     *             value:
     *               data: "1223233"
     *           - type: subscribe
     *             messageId: ReceiveMessage
     *             value:
     *              data: "12340213"
     */
    FERN_EXAMPLES: "x-fern-examples",

    /**
     * Prepends the configured base path to all of the endpoint paths.
     *
     * x-fern-base-path: /v1
     * servers:
     *   - url: https://api.example.com
     * paths:
     *   /path/to/my/endpoint:
     */
    BASE_PATH: "x-fern-base-path",

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
     * Used to tell fern to ignore channels.
     *
     * channels:
     *   /my-channel:
     *     x-fern-ignore: true
     */
    IGNORE: "x-fern-ignore"
} as const;

export type FernAsyncAPIExtension = Values<typeof FernAsyncAPIExtension>;
