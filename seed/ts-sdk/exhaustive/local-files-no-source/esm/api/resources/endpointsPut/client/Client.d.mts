import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace EndpointsPutClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsPutClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsPutClient.Options>;
    constructor(options: EndpointsPutClient.Options);
    /**
     * @param {SeedApi.EndpointsPutAddRequest} request
     * @param {EndpointsPutClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPut.endpointsPutAdd({
     *         id: "id"
     *     })
     */
    endpointsPutAdd(request: SeedApi.EndpointsPutAddRequest, requestOptions?: EndpointsPutClient.RequestOptions): core.HttpResponsePromise<SeedApi.EndpointsPutResponse>;
    private __endpointsPutAdd;
}
