import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
import * as SeedApi from "../../../../../../../index.js";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * This endpoint returns a file by its name.
     *
     * @param {SeedApi.examples.file.GetFileServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.examples.NotFoundError}
     *
     * @example
     *     await client.examples.file.service.getFile({
     *         filename: "file.txt"
     *     })
     */
    getFile(request: SeedApi.examples.file.GetFileServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.examples.File_>;
    private __getFile;
}
