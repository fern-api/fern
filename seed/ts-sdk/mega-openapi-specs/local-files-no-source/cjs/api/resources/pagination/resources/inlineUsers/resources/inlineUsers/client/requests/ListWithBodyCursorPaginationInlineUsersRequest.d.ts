import type * as SeedApi from "../../../../../../../../index.js";
/**
 * @example
 *     {}
 */
export interface ListWithBodyCursorPaginationInlineUsersRequest {
    /**
     * The object that contains the cursor used for pagination
     * in order to fetch the next page of results.
     */
    pagination?: SeedApi.pagination.InlineUsersWithCursor | null;
}
