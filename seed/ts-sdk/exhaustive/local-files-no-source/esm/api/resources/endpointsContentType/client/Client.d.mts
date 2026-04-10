import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace EndpointsContentTypeClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsContentTypeClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsContentTypeClient.Options>;
    constructor(options: EndpointsContentTypeClient.Options);
    /**
     * @param {SeedApi.TypesObjectWithOptionalField} request
     * @param {EndpointsContentTypeClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContentType.endpointsContentTypePostJsonPatchContentType({})
     */
    endpointsContentTypePostJsonPatchContentType(request: SeedApi.TypesObjectWithOptionalField, requestOptions?: EndpointsContentTypeClient.RequestOptions): core.HttpResponsePromise<void>;
    private __endpointsContentTypePostJsonPatchContentType;
    /**
     * @param {SeedApi.TypesObjectWithOptionalField} request
     * @param {EndpointsContentTypeClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContentType.endpointsContentTypePostJsonPatchContentWithCharsetType({})
     */
    endpointsContentTypePostJsonPatchContentWithCharsetType(request: SeedApi.TypesObjectWithOptionalField, requestOptions?: EndpointsContentTypeClient.RequestOptions): core.HttpResponsePromise<void>;
    private __endpointsContentTypePostJsonPatchContentWithCharsetType;
}
