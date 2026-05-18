import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {}
 */
export interface ListWithBodyCursorPaginationUsersRequest {
    /**
     * The object that contains the cursor used for pagination
     * in order to fetch the next page of results.
     */
    pagination?: SeedApi.pagination.WithCursor | null;
}
