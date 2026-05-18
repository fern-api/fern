export declare const ResourceStatus: {
    readonly Active: "ACTIVE";
    readonly Inactive: "INACTIVE";
};
export type ResourceStatus = (typeof ResourceStatus)[keyof typeof ResourceStatus];
