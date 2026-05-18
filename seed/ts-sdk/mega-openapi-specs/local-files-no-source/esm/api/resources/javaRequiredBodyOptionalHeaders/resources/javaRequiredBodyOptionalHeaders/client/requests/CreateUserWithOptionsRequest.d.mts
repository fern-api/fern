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
export interface CreateUserWithOptionsRequest {
    /** Whether to validate the request */
    validate?: boolean | null;
    /** Optional request ID */
    "X-Request-Id"?: string | null;
    body: SeedApi.javaRequiredBodyOptionalHeaders.UserData;
}
