import type * as SeedApi from "../../../index.js";
export interface ListUsersUriPaginationResponse {
    data: SeedApi.paginationUriPath.User[];
    next?: (string | null) | undefined;
}
