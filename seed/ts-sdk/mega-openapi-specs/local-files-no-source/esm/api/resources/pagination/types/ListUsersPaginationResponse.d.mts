import type * as SeedApi from "../../../index.mjs";
export interface ListUsersPaginationResponse {
    hasNextPage?: (boolean | null) | undefined;
    page?: (SeedApi.pagination.Page | null) | undefined;
    /** The totall number of /users */
    total_count: number;
    data: SeedApi.pagination.User[];
}
