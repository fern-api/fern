import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {}
 */
export interface ListWithOffsetPaginationUsersRequest {
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
