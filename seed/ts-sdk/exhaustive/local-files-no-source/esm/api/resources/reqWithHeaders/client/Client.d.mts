import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../index.mjs";
export declare namespace ReqWithHeadersClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ReqWithHeadersClient {
    protected readonly _options: ReqWithHeadersClient.Options;
    constructor(options: ReqWithHeadersClient.Options);
    /**
     * @param {SeedExhaustive.ReqWithHeaders} request
     * @param {ReqWithHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.reqWithHeaders.getWithCustomHeader({
     *         "X-TEST-SERVICE-HEADER": "X-TEST-SERVICE-HEADER",
     *         "X-TEST-ENDPOINT-HEADER": "X-TEST-ENDPOINT-HEADER",
     *         body: "string"
     *     })
     */
    getWithCustomHeader(request: SeedExhaustive.ReqWithHeaders, requestOptions?: ReqWithHeadersClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithCustomHeader;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
