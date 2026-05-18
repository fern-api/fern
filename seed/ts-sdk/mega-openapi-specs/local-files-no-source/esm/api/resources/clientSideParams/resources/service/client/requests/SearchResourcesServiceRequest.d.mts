/**
 * @example
 *     {
 *         limit: 1,
 *         offset: 1
 *     }
 */
export interface SearchResourcesServiceRequest {
    /** Maximum results to return */
    limit: number;
    /** Offset for pagination */
    offset: number;
    /** Search query text */
    query?: string | null;
    filters?: Record<string, unknown> | null;
}
