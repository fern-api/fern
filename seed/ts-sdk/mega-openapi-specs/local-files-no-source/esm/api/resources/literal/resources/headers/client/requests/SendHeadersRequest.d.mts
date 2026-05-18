import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         "X-Endpoint-Version": "02-12-2024",
 *         "X-Async": true,
 *         query: "What is the weather today"
 *     }
 */
export interface SendHeadersRequest {
    "X-Endpoint-Version": SeedApi.literal.SendHeadersRequestXEndpointVersion;
    "X-Async": boolean;
    query: string;
}
