import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace XFernDefaultClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class XFernDefaultClient {
    protected readonly _options: NormalizedClientOptions<XFernDefaultClient.Options>;
    constructor(options: XFernDefaultClient.Options);
    /**
     * @param {SeedApi.xFernDefault.TestGetRequest} request
     * @param {XFernDefaultClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.xFernDefault.testGet({
     *         region: "region"
     *     })
     */
    testGet(request?: SeedApi.xFernDefault.TestGetRequest, requestOptions?: XFernDefaultClient.RequestOptions): core.HttpResponsePromise<SeedApi.xFernDefault.TestGetResponse>;
    private __testGet;
}
