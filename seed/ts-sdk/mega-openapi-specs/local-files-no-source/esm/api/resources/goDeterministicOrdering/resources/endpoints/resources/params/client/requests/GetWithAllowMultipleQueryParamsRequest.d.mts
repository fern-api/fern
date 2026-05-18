/**
 * @example
 *     {
 *         query: ["query"],
 *         number: [1]
 *     }
 */
export interface GetWithAllowMultipleQueryParamsRequest {
    query?: string | string[];
    number?: number | number[];
}
