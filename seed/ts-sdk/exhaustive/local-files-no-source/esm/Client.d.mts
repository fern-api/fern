import { EndpointsClient } from "./api/resources/endpoints/client/Client.mjs";
import { InlinedRequestsClient } from "./api/resources/inlinedRequests/client/Client.mjs";
import { NoAuthClient } from "./api/resources/noAuth/client/Client.mjs";
import { NoReqBodyClient } from "./api/resources/noReqBody/client/Client.mjs";
import { ReqWithHeadersClient } from "./api/resources/reqWithHeaders/client/Client.mjs";
import type { BaseClientOptions, BaseRequestOptions } from "./BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "./BaseClient.mjs";
import * as core from "./core/index.mjs";
export declare namespace SeedExhaustiveClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SeedExhaustiveClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<SeedExhaustiveClient.Options>;
    protected _endpoints: EndpointsClient | undefined;
    protected _inlinedRequests: InlinedRequestsClient | undefined;
    protected _noAuth: NoAuthClient | undefined;
    protected _noReqBody: NoReqBodyClient | undefined;
    protected _reqWithHeaders: ReqWithHeadersClient | undefined;
    constructor(options: SeedExhaustiveClient.Options);
    get endpoints(): EndpointsClient;
    get inlinedRequests(): InlinedRequestsClient;
    get noAuth(): NoAuthClient;
    get noReqBody(): NoReqBodyClient;
    get reqWithHeaders(): ReqWithHeadersClient;
    /**
     * Make a passthrough request using the SDK's configured auth, retry, logging, etc.
     * This is useful for making requests to endpoints not yet supported in the SDK.
     * The input can be a URL string, URL object, or Request object. Relative paths are resolved against the configured base URL.
     *
     * @param {Request | string | URL} input - The URL, path, or Request object.
     * @param {RequestInit} init - Standard fetch RequestInit options.
     * @param {core.PassthroughRequest.RequestOptions} requestOptions - Per-request overrides (timeout, retries, headers, abort signal).
     * @returns {Promise<Response>} A standard Response object.
     */
    fetch(input: Request | string | URL, init?: RequestInit, requestOptions?: core.PassthroughRequest.RequestOptions): Promise<Response>;
}
