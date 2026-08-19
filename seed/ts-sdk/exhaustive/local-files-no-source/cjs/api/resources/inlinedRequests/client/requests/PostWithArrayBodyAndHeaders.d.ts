/**
 * @example
 *     {
 *         "X-Custom-Header": "X-Custom-Header",
 *         body: ["string", "string"]
 *     }
 */
export interface PostWithArrayBodyAndHeaders {
    "X-Custom-Header"?: string;
    body: string[];
}
