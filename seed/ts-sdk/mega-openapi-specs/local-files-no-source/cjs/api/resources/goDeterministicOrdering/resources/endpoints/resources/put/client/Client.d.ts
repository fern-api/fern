import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../../index.js";
export declare namespace PutClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PutClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PutClient.Options>;
    constructor(options: PutClient.Options);
    /**
     * @param {SeedApi.goDeterministicOrdering.endpoints.AddPutRequest} request
     * @param {PutClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.put.add({
     *         id: "id"
     *     })
     */
    add(request: SeedApi.goDeterministicOrdering.endpoints.AddPutRequest, requestOptions?: PutClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.EndpointsPutResponse>;
    private __add;
}
