import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
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
