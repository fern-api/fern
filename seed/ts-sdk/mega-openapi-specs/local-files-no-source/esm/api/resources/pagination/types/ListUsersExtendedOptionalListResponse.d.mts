import type * as SeedApi from "../../../index.mjs";
export interface ListUsersExtendedOptionalListResponse extends SeedApi.pagination.UserOptionalListPage {
    /** The totall number of /users */
    total_count: number;
}
