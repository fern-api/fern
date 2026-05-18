export interface UpdateVendorRequest {
    name: string;
    status?: UpdateVendorRequest.Status | undefined;
}
export declare namespace UpdateVendorRequest {
    const Status: {
        readonly Active: "ACTIVE";
        readonly Inactive: "INACTIVE";
    };
    type Status = (typeof Status)[keyof typeof Status];
}
