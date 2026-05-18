import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace MultipleRequestBodiesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class MultipleRequestBodiesClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<MultipleRequestBodiesClient.Options>;
    constructor(options: MultipleRequestBodiesClient.Options);
    /**
     * @param {SeedApi.multipleRequestBodies.UploadJsonDocumentRequest} request
     * @param {MultipleRequestBodiesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.multipleRequestBodies.multipleRequestBodies.uploadJsonDocument()
     */
    uploadJsonDocument(request?: SeedApi.multipleRequestBodies.UploadJsonDocumentRequest, requestOptions?: MultipleRequestBodiesClient.RequestOptions): core.HttpResponsePromise<SeedApi.multipleRequestBodies.UploadDocumentResponse>;
    private __uploadJsonDocument;
    /**
     * @param {core.file.Uploadable} uploadable
     * @param {MultipleRequestBodiesClient.RequestOptions} requestOptions - Request-specific configuration.
     */
    uploadPdfDocument(uploadable: core.file.Uploadable, requestOptions?: MultipleRequestBodiesClient.RequestOptions): core.HttpResponsePromise<SeedApi.multipleRequestBodies.UploadDocumentResponse>;
    private __uploadPdfDocument;
}
