import type * as SeedApi from "../../../index.js";
export interface ListUsersTopLevelCursorPaginationResponse {
    next_cursor?: (string | null) | undefined;
    data: SeedApi.pagination.User[];
}
