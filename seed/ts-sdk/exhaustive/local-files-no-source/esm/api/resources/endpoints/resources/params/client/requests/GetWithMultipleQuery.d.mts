/**
 * @example
 *     {
 *         query: ["query", "query"],
 *         number: [1, 1]
 *     }
 */
export interface GetWithMultipleQuery {
    query: string | string[];
    number: number | number[];
}
