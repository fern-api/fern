import type * as SeedApi from "../../../index.mjs";
export interface InlineUsersListUsersPaginationResponse {
    hasNextPage?: (boolean | null) | undefined;
    page?: (SeedApi.pagination.InlineUsersPage | null) | undefined;
    /** The totall number of /users */
    total_count: number;
    data: SeedApi.pagination.InlineUsersUsers;
}
