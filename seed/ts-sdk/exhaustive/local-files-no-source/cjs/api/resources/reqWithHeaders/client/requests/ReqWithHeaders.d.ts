/**
 * @example
 *     {
 *         "X-TEST-SERVICE-HEADER": "service`value",
 *         "X-TEST-ENDPOINT-HEADER": "endpoint\"value",
 *         body: "string"
 *     }
 */
export interface ReqWithHeaders {
    "X-TEST-SERVICE-HEADER": string;
    "X-TEST-ENDPOINT-HEADER": string;
    body: string;
}
