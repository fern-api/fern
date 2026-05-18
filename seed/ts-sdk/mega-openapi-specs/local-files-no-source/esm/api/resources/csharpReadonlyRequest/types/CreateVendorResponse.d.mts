import type * as SeedApi from "../../../index.mjs";
/**
 * Response from creating vendors
 */
export interface CreateVendorResponse {
    /** Map of vendor ID to created vendor */
    vendors: Record<string, SeedApi.csharpReadonlyRequest.Vendor>;
}
