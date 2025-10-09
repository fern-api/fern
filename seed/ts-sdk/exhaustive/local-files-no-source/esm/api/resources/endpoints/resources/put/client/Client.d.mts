import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import * as SeedExhaustive from "../../../../../index.mjs";
export declare namespace Put {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Put {
    protected readonly _options: Put.Options;
    constructor(_options: Put.Options);
    /**
     * @param {SeedExhaustive.endpoints.PutRequest} request
     * @param {Put.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.put.add({
     *         id: "id"
     *     })
     */
    add(request: SeedExhaustive.endpoints.PutRequest, requestOptions?: Put.RequestOptions): core.HttpResponsePromise<SeedExhaustive.endpoints.PutResponse>;
    private __add;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
