import type * as SeedApi from "../../../index.mjs";
export interface ListUsersExtendedResponse extends SeedApi.pagination.UserPage {
    /** The totall number of /users */
    total_count: number;
}
