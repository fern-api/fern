import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace FilesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class FilesClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<FilesClient.Options>;
    constructor(options: FilesClient.Options);
    /**
     * @param {SeedApi.multiUrlEnvironmentReference.FilesUploadRequest} request
     * @param {FilesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.multiUrlEnvironmentReference.files.upload({
     *         name: "name",
     *         parent_id: "parent_id"
     *     })
     */
    upload(request: SeedApi.multiUrlEnvironmentReference.FilesUploadRequest, requestOptions?: FilesClient.RequestOptions): core.HttpResponsePromise<string>;
    private __upload;
}
