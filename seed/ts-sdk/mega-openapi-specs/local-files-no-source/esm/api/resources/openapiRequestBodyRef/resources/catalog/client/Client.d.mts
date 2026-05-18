import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace CatalogClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class CatalogClient {
    protected readonly _options: NormalizedClientOptions<CatalogClient.Options>;
    constructor(options: CatalogClient.Options);
    /**
     * @param {SeedApi.openapiRequestBodyRef.CreateCatalogImageBody} request
     * @param {CatalogClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.openapiRequestBodyRef.catalog.createCatalogImage({
     *         request: {
     *             catalog_object_id: "catalog_object_id"
     *         }
     *     })
     */
    createCatalogImage(request: SeedApi.openapiRequestBodyRef.CreateCatalogImageBody, requestOptions?: CatalogClient.RequestOptions): core.HttpResponsePromise<SeedApi.openapiRequestBodyRef.CatalogImage>;
    private __createCatalogImage;
    /**
     * @param {SeedApi.openapiRequestBodyRef.GetCatalogImageRequest} request
     * @param {CatalogClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.openapiRequestBodyRef.catalog.getCatalogImage({
     *         image_id: "image_id"
     *     })
     */
    getCatalogImage(request: SeedApi.openapiRequestBodyRef.GetCatalogImageRequest, requestOptions?: CatalogClient.RequestOptions): core.HttpResponsePromise<SeedApi.openapiRequestBodyRef.CatalogImage>;
    private __getCatalogImage;
}
