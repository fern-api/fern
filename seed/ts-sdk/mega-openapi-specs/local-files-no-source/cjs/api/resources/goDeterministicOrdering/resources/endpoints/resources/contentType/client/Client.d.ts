import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../../index.js";
export declare namespace ContentTypeClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ContentTypeClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ContentTypeClient.Options>;
    constructor(options: ContentTypeClient.Options);
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField} request
     * @param {ContentTypeClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.contentType.postJsonPatchContentType({})
     */
    postJsonPatchContentType(request: SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField, requestOptions?: ContentTypeClient.RequestOptions): core.HttpResponsePromise<void>;
    private __postJsonPatchContentType;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField} request
     * @param {ContentTypeClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.contentType.postJsonPatchContentWithCharsetType({})
     */
    postJsonPatchContentWithCharsetType(request: SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField, requestOptions?: ContentTypeClient.RequestOptions): core.HttpResponsePromise<void>;
    private __postJsonPatchContentWithCharsetType;
}
