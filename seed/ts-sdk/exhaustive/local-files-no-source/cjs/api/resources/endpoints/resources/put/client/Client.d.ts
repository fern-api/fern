import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare namespace PutClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PutClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PutClient.Options>;
    constructor(options: PutClient.Options);
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
    private __add;
}
