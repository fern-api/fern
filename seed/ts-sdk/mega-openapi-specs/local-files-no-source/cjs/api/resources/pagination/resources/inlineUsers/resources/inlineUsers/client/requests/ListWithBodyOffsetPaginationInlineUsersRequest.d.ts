import type * as SeedApi from "../../../../../../../../index.js";
/**
 * @example
 *     {}
 */
export interface ListWithBodyOffsetPaginationInlineUsersRequest {
    /**
     * The object that contains the offset used for pagination
     * in order to fetch the next page of results.
     */
    pagination?: SeedApi.pagination.InlineUsersWithPage | null;
}
