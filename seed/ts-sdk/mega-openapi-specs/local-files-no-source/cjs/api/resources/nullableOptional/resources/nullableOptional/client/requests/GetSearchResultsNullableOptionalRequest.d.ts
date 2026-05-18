/**
 * @example
 *     {
 *         query: "query"
 *     }
 */
export interface GetSearchResultsNullableOptionalRequest {
    query: string;
    filters?: Record<string, string | null> | null;
    includeTypes: string[] | null;
}
