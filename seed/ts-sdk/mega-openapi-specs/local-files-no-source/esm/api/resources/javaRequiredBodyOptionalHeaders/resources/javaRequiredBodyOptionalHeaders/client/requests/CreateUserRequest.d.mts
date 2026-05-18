import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         body: {
 *             name: "name",
 *             email: "email"
 *         }
 *     }
 */
export interface CreateUserRequest {
    /** Optional correlation ID for request tracing */
    "X-Correlation-Id"?: string | null;
    body: SeedApi.javaRequiredBodyOptionalHeaders.UserData;
}
