/**
 * @example
 *     {
 *         cursor: "initial_cursor",
 *         filter: "active"
 *     }
 */
export interface ListWithTopLevelBodyCursorPaginationUsersRequest {
    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     */
    cursor?: string | null;
    /** An optional filter to apply to the results. */
    filter?: string | null;
}
