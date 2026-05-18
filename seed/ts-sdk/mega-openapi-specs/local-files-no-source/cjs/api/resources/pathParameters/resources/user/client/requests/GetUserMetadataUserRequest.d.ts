/**
 * @example
 *     {
 *         tenant_id: "tenant_id",
 *         user_id: "user_id",
 *         version: 1
 *     }
 */
export interface GetUserMetadataUserRequest {
    tenant_id: string;
    user_id: string;
    version: number;
}
