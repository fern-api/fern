/**
 * @example
 *     {}
 */
export interface ListItemsPaginationRequest {
    /** The cursor for pagination */
    cursor?: string | null;
    /** Maximum number of items to return */
    limit?: number | null;
}
