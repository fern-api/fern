import type * as SeedApi from "../../../../../../../../index.mjs";
/**
 * @example
 *     {}
 */
export interface ListWithOffsetPaginationHasNextPageInlineUsersRequest {
    /** Defaults to first page */
    page?: number | null;
    /**
     * The maximum number of elements to return.
     * This is also used as the step size in this
     * paginated endpoint.
     */
    limit?: number | null;
    order?: SeedApi.pagination.InlineUsersOrder | null;
}
