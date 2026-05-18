/**
 * @example
 *     {
 *         name: "name",
 *         email: "email"
 *     }
 */
export interface CreateUserInlinedRequest {
    /** Optional trace ID for request tracing */
    "X-Trace-Id"?: string | null;
    name: string;
    email: string;
    /** User's age */
    age?: number | null;
}
