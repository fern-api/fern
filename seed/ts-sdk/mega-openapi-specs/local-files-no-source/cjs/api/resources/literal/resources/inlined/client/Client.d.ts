import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace InlinedClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class InlinedClient {
    protected readonly _options: NormalizedClientOptions<InlinedClient.Options>;
    constructor(options: InlinedClient.Options);
    /**
     * @param {SeedApi.literal.SendInlinedRequest} request
     * @param {InlinedClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.literal.inlined.send({
     *         prompt: "You are a helpful assistant",
     *         context: "You're super wise",
     *         query: "What is the weather today",
     *         temperature: 10.1,
     *         stream: false,
     *         aliasedContext: "You're super wise",
     *         maybeContext: "You're super wise",
     *         objectWithLiteral: {
     *             nestedLiteral: {
     *                 myLiteral: "How super cool"
     *             }
     *         }
     *     })
     */
    send(request: SeedApi.literal.SendInlinedRequest, requestOptions?: InlinedClient.RequestOptions): core.HttpResponsePromise<SeedApi.literal.SendResponse>;
    private __send;
}
