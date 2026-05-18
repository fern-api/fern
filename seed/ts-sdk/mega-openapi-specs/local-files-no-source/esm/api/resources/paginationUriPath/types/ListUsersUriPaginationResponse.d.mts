import type * as SeedApi from "../../../index.mjs";
export interface ListUsersUriPaginationResponse {
    data: SeedApi.paginationUriPath.User[];
    next?: (string | null) | undefined;
}
