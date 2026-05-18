import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace VendorClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class VendorClient {
    protected readonly _options: NormalizedClientOptions<VendorClient.Options>;
    constructor(options: VendorClient.Options);
    /**
     * @param {SeedApi.openapiRequestBodyRef.UpdateVendorBody} request
     * @param {VendorClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.openapiRequestBodyRef.vendor.updateVendor({
     *         vendor_id: "vendor_id",
     *         body: {
     *             name: "name"
     *         }
     *     })
     */
    updateVendor(request: SeedApi.openapiRequestBodyRef.UpdateVendorBody, requestOptions?: VendorClient.RequestOptions): core.HttpResponsePromise<SeedApi.openapiRequestBodyRef.Vendor>;
    private __updateVendor;
    /**
     * @param {SeedApi.openapiRequestBodyRef.CreateVendorRequest} request
     * @param {VendorClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.openapiRequestBodyRef.vendor.createVendor({
     *         name: "name"
     *     })
     */
    createVendor(request: SeedApi.openapiRequestBodyRef.CreateVendorRequest, requestOptions?: VendorClient.RequestOptions): core.HttpResponsePromise<SeedApi.openapiRequestBodyRef.Vendor>;
    private __createVendor;
}
