import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../../index.js";
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
     *     await client.audiences.folderD.service.getDirectThread()
     */
    getDirectThread(requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.audiences.FolderDResponse>;
    private __getDirectThread;
}
