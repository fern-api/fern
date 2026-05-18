import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.fileDownload.service.simple()
     */
    simple(requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __simple;
    /**
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.fileDownload.service.downloadFile()
     */
    downloadFile(requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __downloadFile;
}
