/**
 * @example
 *     {
 *         query: "query"
 *     }
 */
export interface GetWithPathAndQuery {
    query: string;
}
export declare namespace GetWithPathAndQuery {
    namespace _ {
        function qs(request: GetWithPathAndQuery): Record<string, unknown>;
    }
}
