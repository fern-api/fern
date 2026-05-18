import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         tenantId: "tenantId",
 *         body: {
 *             name: "name",
 *             email: "email"
 *         }
 *     }
 */
export interface CreateUserWithRequiredQueryRequest {
    /** Required tenant ID */
    tenantId: string;
    body: SeedApi.javaRequiredBodyOptionalHeaders.UserData;
}
