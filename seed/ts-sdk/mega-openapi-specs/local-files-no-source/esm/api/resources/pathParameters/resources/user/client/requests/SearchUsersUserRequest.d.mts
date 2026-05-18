/**
 * @example
 *     {
 *         tenant_id: "tenant_id",
 *         user_id: "user_id"
 *     }
 */
export interface SearchUsersUserRequest {
    tenant_id: string;
    user_id: string;
    limit?: number | null;
}
