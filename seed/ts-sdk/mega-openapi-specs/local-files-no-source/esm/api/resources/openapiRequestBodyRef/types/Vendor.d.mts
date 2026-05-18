import type * as SeedApi from "../../../index.mjs";
export interface Vendor {
    id: string;
    name: string;
    status?: Vendor.Status | undefined;
    update_request?: SeedApi.openapiRequestBodyRef.UpdateVendorRequest | undefined;
}
export declare namespace Vendor {
    const Status: {
        readonly Active: "ACTIVE";
        readonly Inactive: "INACTIVE";
    };
    type Status = (typeof Status)[keyof typeof Status];
}
