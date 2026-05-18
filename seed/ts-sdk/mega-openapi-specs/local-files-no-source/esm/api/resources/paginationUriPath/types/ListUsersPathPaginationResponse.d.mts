import type * as SeedApi from "../../../index.mjs";
export interface ListUsersPathPaginationResponse {
    data: SeedApi.paginationUriPath.User[];
    next?: (string | null) | undefined;
}
