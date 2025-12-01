/**
 * @example
 *     {
 *         query: "query",
 *         number: 1
 *     }
 */
export interface GetWithMultipleQuery {
    query: string | string[];
    number: number | number[];
}
export declare namespace GetWithMultipleQuery {
    namespace _ {
        function qs(request: GetWithMultipleQuery): Record<string, unknown>;
    }
}
