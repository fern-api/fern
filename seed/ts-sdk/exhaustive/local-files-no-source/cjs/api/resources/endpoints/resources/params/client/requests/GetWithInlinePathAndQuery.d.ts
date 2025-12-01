/**
 * @example
 *     {
 *         param: "param",
 *         query: "query"
 *     }
 */
export interface GetWithInlinePathAndQuery {
    param: string;
    query: string;
}
export declare namespace GetWithInlinePathAndQuery {
    namespace _ {
        function qs(request: GetWithInlinePathAndQuery): Record<string, unknown>;
    }
}
