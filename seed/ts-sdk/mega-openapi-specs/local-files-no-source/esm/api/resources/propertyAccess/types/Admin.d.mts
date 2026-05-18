import type * as SeedApi from "../../../index.mjs";
/**
 * Admin user object
 */
export interface Admin extends SeedApi.propertyAccess.User {
    /** The level of admin privileges. */
    adminLevel: string;
}
