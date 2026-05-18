import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {core.file.Uploadable} uploadable
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     */
    upload(uploadable: core.file.Uploadable, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __upload;
}
