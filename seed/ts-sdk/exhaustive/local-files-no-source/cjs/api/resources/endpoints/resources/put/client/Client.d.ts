import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type { PutResponse } from "../types/PutResponse.js";
import type { PutRequest } from "./requests/PutRequest.js";
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
     * @param {PutRequest} request
     * @param {Put.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.put.add({
     *         id: "id"
     *     })
     */
    add(request: PutRequest, requestOptions?: Put.RequestOptions): core.HttpResponsePromise<PutResponse>;
    private __add;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
