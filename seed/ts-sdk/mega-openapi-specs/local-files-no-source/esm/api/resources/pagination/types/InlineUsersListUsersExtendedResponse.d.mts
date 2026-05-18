import type * as SeedApi from "../../../index.mjs";
export interface InlineUsersListUsersExtendedResponse extends SeedApi.pagination.InlineUsersUserPage {
    /** The totall number of /users */
    total_count: number;
}
