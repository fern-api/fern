import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ReferenceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ReferenceClient {
    protected readonly _options: NormalizedClientOptions<ReferenceClient.Options>;
    constructor(options: ReferenceClient.Options);
    /**
     * @param {SeedApi.literal.SendRequest} request
     * @param {ReferenceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.literal.reference.send({
     *         prompt: "You are a helpful assistant",
     *         query: "What is the weather today",
     *         stream: false,
     *         ending: "\\$ending",
     *         context: "You're super wise",
     *         containerObject: {
     *             nestedObjects: [{
     *                     literal1: "literal1",
     *                     literal2: "literal2",
     *                     strProp: "strProp"
     *                 }]
     *         }
     *     })
     */
    send(request: SeedApi.literal.SendRequest, requestOptions?: ReferenceClient.RequestOptions): core.HttpResponsePromise<SeedApi.literal.SendResponse>;
    private __send;
}
