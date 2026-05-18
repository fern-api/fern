import type * as SeedApi from "../../../index.js";
/**
 * Response from creating vendors
 */
export interface CreateVendorResponse {
    /** Map of vendor ID to created vendor */
    vendors: Record<string, SeedApi.csharpReadonlyRequest.Vendor>;
}
