import type * as SeedApi from "../../../../../../index.js";
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
