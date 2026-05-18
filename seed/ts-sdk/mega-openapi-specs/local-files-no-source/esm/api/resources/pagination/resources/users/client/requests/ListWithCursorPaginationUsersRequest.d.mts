import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {}
 */
export interface ListWithCursorPaginationUsersRequest {
    /** Defaults to first page */
    page?: number | null;
    /** Defaults to per page */
    per_page?: number | null;
    order?: SeedApi.pagination.Order | null;
    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     */
    starting_after?: string | null;
}
