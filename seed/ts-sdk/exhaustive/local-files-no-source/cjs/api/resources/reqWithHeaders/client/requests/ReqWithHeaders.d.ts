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
