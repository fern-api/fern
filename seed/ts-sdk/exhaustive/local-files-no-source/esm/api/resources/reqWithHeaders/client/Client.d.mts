import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace ReqWithHeadersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ReqWithHeadersClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ReqWithHeadersClient.Options>;
    constructor(options: ReqWithHeadersClient.Options);
    /**
     * @param {SeedApi.GetWithCustomHeaderReqWithHeadersRequest} request
     * @param {ReqWithHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.reqWithHeaders.getWithCustomHeader({
     *         "X-TEST-ENDPOINT-HEADER": "X-TEST-ENDPOINT-HEADER",
     *         body: "string"
     *     })
     */
    getWithCustomHeader(request: SeedApi.GetWithCustomHeaderReqWithHeadersRequest, requestOptions?: ReqWithHeadersClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithCustomHeader;
}
