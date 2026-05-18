import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
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
     *     await client.oauthClientCredentialsEnvironmentVariables.nestedNoAuthApi.nestedNoAuthApiGetSomething()
     */
    nestedNoAuthApiGetSomething(requestOptions?: NestedNoAuthApiClient.RequestOptions): core.HttpResponsePromise<void>;
    private __nestedNoAuthApiGetSomething;
}
