/**
 * @example
 *     {
 *         param: "param",
 *         body: "string"
 *     }
 */
export interface ModifyResourceAtInlinedPath {
    param: string;
    body: string;
}
export declare namespace ModifyResourceAtInlinedPath {
    namespace _ {
        function body(request: ModifyResourceAtInlinedPath): unknown;
    }
}
