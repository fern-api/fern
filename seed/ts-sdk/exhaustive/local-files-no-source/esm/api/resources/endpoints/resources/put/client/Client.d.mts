import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type { PutResponse } from "../types/PutResponse.mjs";
import type { PutRequest } from "./requests/PutRequest.mjs";
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
     * @param {PutRequest} request
     * @param {PutClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.put.add({
     *         id: "id"
     *     })
     */
    add(request: PutRequest, requestOptions?: PutClient.RequestOptions): core.HttpResponsePromise<PutResponse>;
    private __add;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
