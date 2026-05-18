import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace LicenseClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class LicenseClient {
    protected readonly _options: NormalizedClientOptions<LicenseClient.Options>;
    constructor(options: LicenseClient.Options);
    /**
     * @param {LicenseClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.license.license.get()
     */
    get(requestOptions?: LicenseClient.RequestOptions): core.HttpResponsePromise<void>;
    private __get;
}
