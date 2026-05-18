import type * as SeedApi from "../../../index.js";
export interface ListUsersPathPaginationResponse {
    data: SeedApi.paginationUriPath.User[];
    next?: (string | null) | undefined;
}
