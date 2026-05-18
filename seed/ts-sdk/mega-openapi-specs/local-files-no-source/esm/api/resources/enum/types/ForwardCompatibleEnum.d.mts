/**
 * Tests forward-compatible enums that accept
 * both known values and arbitrary strings.
 */
export declare const ForwardCompatibleEnum: {
    readonly Active: "active";
    readonly Inactive: "inactive";
};
export type ForwardCompatibleEnum = (typeof ForwardCompatibleEnum)[keyof typeof ForwardCompatibleEnum];
