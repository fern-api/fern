/**
 * @example
 *     {
 *         query: "query"
 *     }
 */
export interface SearchPoliciesRequest {
    /** Required search query */
    query: string;
    /** Optional limit */
    limit?: number | null;
}
