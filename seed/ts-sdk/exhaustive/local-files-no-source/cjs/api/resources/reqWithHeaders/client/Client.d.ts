import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedExhaustive from "../../../index.js";
export declare namespace ReqWithHeaders {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ReqWithHeaders {
    protected readonly _options: ReqWithHeaders.Options;
    constructor(_options: ReqWithHeaders.Options);
    /**
     * @param {SeedExhaustive.ReqWithHeaders} request
     * @param {ReqWithHeaders.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.reqWithHeaders.getWithCustomHeader({
     *         "X-TEST-SERVICE-HEADER": "X-TEST-SERVICE-HEADER",
     *         "X-TEST-ENDPOINT-HEADER": "X-TEST-ENDPOINT-HEADER",
     *         body: "string"
     *     })
     */
    getWithCustomHeader(request: SeedExhaustive.ReqWithHeaders, requestOptions?: ReqWithHeaders.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithCustomHeader;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
