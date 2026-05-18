import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         tenant_id: "tenant_id",
 *         body: {
 *             name: "name",
 *             tags: ["tags"]
 *         }
 *     }
 */
export interface CreateUserUserRequest {
    tenant_id: string;
    body: SeedApi.pathParameters.User;
}
