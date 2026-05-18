import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
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
    /**
     * @param {core.file.Uploadable} uploadable
     * @param {SeedApi.bytesUpload.UploadWithQueryParamsServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     */
    uploadWithQueryParams(uploadable: core.file.Uploadable, request: SeedApi.bytesUpload.UploadWithQueryParamsServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __uploadWithQueryParams;
}
