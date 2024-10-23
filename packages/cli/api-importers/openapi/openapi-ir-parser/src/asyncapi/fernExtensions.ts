import { Values } from "@fern-api/core-utils";

export const FernAsyncAPIExtension = {
    /**
     * The x-fern-summary allows you to specify a display name for the websocket channel.
     */
    FERN_DISPLAY_NAME: "x-fern-display-name",

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
    BASE_PATH: "x-fern-base-path"
} as const;

export type FernAsyncAPIExtension = Values<typeof FernAsyncAPIExtension>;
