import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare namespace PutClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PutClient {
    protected readonly _options: PutClient.Options;
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
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
