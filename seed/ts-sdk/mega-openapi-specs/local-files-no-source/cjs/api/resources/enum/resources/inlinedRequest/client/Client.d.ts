import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace InlinedRequestClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class InlinedRequestClient {
    protected readonly _options: NormalizedClientOptions<InlinedRequestClient.Options>;
    constructor(options: InlinedRequestClient.Options);
    /**
     * @param {SeedApi.enum_.SendInlinedRequestRequest} request
     * @param {InlinedRequestClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.enum.inlinedRequest.send({
     *         operand: ">",
     *         operandOrColor: "red"
     *     })
     */
    send(request: SeedApi.enum_.SendInlinedRequestRequest, requestOptions?: InlinedRequestClient.RequestOptions): core.HttpResponsePromise<void>;
    private __send;
}
