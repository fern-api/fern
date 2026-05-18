import type * as SeedApi from "../../../../../../../../index.mjs";
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
