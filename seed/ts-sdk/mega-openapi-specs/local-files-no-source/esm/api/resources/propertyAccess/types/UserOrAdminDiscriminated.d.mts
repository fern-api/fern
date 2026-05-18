import type * as SeedApi from "../../../index.mjs";
/**
 * Example of an discriminated union
 */
export type UserOrAdminDiscriminated = {
    type: "user";
} | {
    type: "admin";
    admin?: SeedApi.propertyAccess.Admin | undefined;
} | {
    type: "empty";
};
