/**
 * @example
 *     {}
 */
export interface ListWithCustomPagerUsersRequest {
    /** The maximum number of results to return. */
    limit?: number | null;
    /** The cursor used for pagination. */
    starting_after?: string | null;
}
