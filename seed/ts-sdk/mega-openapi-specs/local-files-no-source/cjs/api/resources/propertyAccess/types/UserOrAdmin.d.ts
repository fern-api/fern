import type * as SeedApi from "../../../index.js";
/**
 * Example of an undiscriminated union
 */
export type UserOrAdmin = SeedApi.propertyAccess.User | SeedApi.propertyAccess.Admin;
