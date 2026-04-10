import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace ReqwithheadersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ReqwithheadersClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ReqwithheadersClient.Options>;
    constructor(options: ReqwithheadersClient.Options);
    /**
     * @param {SeedApi.ReqWithHeadersGetWithCustomHeaderRequest} request
     * @param {ReqwithheadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.reqwithheaders.getwithcustomheader({
     *         "X-TEST-ENDPOINT-HEADER": "X-TEST-ENDPOINT-HEADER",
     *         body: "string"
     *     })
     */
    getwithcustomheader(request: SeedApi.ReqWithHeadersGetWithCustomHeaderRequest, requestOptions?: ReqwithheadersClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getwithcustomheader;
}
