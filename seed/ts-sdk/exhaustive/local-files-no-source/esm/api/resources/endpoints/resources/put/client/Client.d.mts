import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace PutClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PutClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PutClient.Options>;
    constructor(options: PutClient.Options);
    /**
     * @param {SeedApi.endpoints.AddPutRequest} request
     * @param {PutClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.put.add({
     *         id: "id"
     *     })
     */
    add(request: SeedApi.endpoints.AddPutRequest, requestOptions?: PutClient.RequestOptions): core.HttpResponsePromise<SeedApi.EndpointsPutResponse>;
    private __add;
}
