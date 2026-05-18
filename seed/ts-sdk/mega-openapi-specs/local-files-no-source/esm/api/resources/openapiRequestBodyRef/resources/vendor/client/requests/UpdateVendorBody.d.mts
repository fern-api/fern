import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         vendor_id: "vendor_id",
 *         body: {
 *             name: "name"
 *         }
 *     }
 */
export interface UpdateVendorBody {
    vendor_id: string;
    body: SeedApi.openapiRequestBodyRef.UpdateVendorRequest;
}
