import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../../../index.mjs";
export declare namespace MetadataClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class MetadataClient {
    protected readonly _options: NormalizedClientOptions<MetadataClient.Options>;
    constructor(options: MetadataClient.Options);
    /**
     * Get event metadata.
     *
     * @param {SeedApi.mixedFileDirectory.user.events.GetMetadataMetadataRequest} request
     * @param {MetadataClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.mixedFileDirectory.user.events.metadata.getMetadata({
     *         id: "id"
     *     })
     */
    getMetadata(request: SeedApi.mixedFileDirectory.user.events.GetMetadataMetadataRequest, requestOptions?: MetadataClient.RequestOptions): core.HttpResponsePromise<SeedApi.mixedFileDirectory.UsereventsMetadata>;
    private __getMetadata;
}
