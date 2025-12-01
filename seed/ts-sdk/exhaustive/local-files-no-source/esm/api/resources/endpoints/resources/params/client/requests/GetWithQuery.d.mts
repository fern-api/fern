/**
 * @example
 *     {
 *         query: "query",
 *         number: 1
 *     }
 */
export interface GetWithQuery {
    query: string;
    number: number;
}
export declare namespace GetWithQuery {
    namespace _ {
        function qs(request: GetWithQuery): Record<string, unknown>;
    }
}
