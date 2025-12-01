/**
 * @example
 *     {
 *         "X-TEST-SERVICE-HEADER": "X-TEST-SERVICE-HEADER",
 *         "X-TEST-ENDPOINT-HEADER": "X-TEST-ENDPOINT-HEADER",
 *         body: "string"
 *     }
 */
export interface ReqWithHeaders {
    "X-TEST-SERVICE-HEADER": string;
    "X-TEST-ENDPOINT-HEADER": string;
    body: string;
}
export declare namespace ReqWithHeaders {
    namespace _ {
        function headers(request: ReqWithHeaders): Record<string, string>;
        function body(request: ReqWithHeaders): unknown;
    }
}
