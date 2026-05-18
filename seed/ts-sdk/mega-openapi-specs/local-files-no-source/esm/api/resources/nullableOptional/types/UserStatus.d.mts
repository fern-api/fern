/** Test enum with values for optional enum fields */
export declare const UserStatus: {
    readonly Active: "active";
    readonly Inactive: "inactive";
    readonly Suspended: "suspended";
    readonly Deleted: "deleted";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
