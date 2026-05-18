import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace NestedNoAuthApiClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NestedNoAuthApiClient {
    protected readonly _options: NormalizedClientOptions<NestedNoAuthApiClient.Options>;
    constructor(options: NestedNoAuthApiClient.Options);
    /**
     * @param {NestedNoAuthApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.inferredAuthExplicit.nestedNoAuthApi.nestedNoAuthApiGetSomething()
     */
    nestedNoAuthApiGetSomething(requestOptions?: NestedNoAuthApiClient.RequestOptions): core.HttpResponsePromise<void>;
    private __nestedNoAuthApiGetSomething;
}
