import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
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
