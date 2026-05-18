import type * as SeedApi from "../../../index.mjs";
export interface ListUsersTopLevelCursorPaginationResponse {
    next_cursor?: (string | null) | undefined;
    data: SeedApi.pagination.User[];
}
