import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         tenant_id: "tenant_id",
 *         user_id: "user_id",
 *         body: {
 *             name: "name",
 *             tags: ["tags"]
 *         }
 *     }
 */
export interface UpdateUserUserRequest {
    tenant_id: string;
    user_id: string;
    body: SeedApi.pathParameters.User;
}
