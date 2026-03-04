import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare namespace PutClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PutClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PutClient.Options>;
    protected readonly _requestFn: core.RequestFn;
    constructor(options: PutClient.Options);
    constructor(options: PutClient.Options, requestFn: core.RequestFn);
    /**
     * @param {SeedExhaustive.endpoints.PutRequest} request
     * @param {PutClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.put.add({
     *         id: "id"
     *     })
     */
    add(request: SeedExhaustive.endpoints.PutRequest, requestOptions?: PutClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.endpoints.PutResponse>;
}
