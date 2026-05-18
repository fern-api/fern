import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace MultipartFormClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class MultipartFormClient {
    protected readonly _options: NormalizedClientOptions<MultipartFormClient.Options>;
    constructor(options: MultipartFormClient.Options);
    /**
     * @param {SeedApi.enum_.MultipartFormMultipartFormRequest} request
     * @param {MultipartFormClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.enum.multipartForm.multipartForm({})
     */
    multipartForm(request: SeedApi.enum_.MultipartFormMultipartFormRequest, requestOptions?: MultipartFormClient.RequestOptions): core.HttpResponsePromise<void>;
    private __multipartForm;
}
