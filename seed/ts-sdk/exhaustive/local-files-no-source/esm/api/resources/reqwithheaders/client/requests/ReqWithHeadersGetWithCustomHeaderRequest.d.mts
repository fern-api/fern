/**
 * @example
 *     {
 *         "X-TEST-ENDPOINT-HEADER": "X-TEST-ENDPOINT-HEADER",
 *         body: "string"
 *     }
 */
export interface ReqWithHeadersGetWithCustomHeaderRequest {
    "X-TEST-ENDPOINT-HEADER": string;
    body: string;
}
