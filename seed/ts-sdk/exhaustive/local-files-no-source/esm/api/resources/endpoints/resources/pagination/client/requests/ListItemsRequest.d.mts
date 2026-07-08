/**
 * @example
 *     {
 *         cursor: "cursor",
 *         limit: 1
 *     }
 */
export interface ListItemsRequest {
    /** The cursor for pagination */
    cursor?: string | undefined;
    /** Maximum number of items to return */
    limit?: number | undefined;
}
