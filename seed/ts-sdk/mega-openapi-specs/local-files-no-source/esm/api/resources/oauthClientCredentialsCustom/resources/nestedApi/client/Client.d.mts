import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace NestedApiClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NestedApiClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<NestedApiClient.Options>;
    constructor(options: NestedApiClient.Options);
    /**
     * @param {NestedApiClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentialsCustom.nestedApi.nestedApiGetSomething()
     */
    nestedApiGetSomething(requestOptions?: NestedApiClient.RequestOptions): core.HttpResponsePromise<void>;
    private __nestedApiGetSomething;
}
