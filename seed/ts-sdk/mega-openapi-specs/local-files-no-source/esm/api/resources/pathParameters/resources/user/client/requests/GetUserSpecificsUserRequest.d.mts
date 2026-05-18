/**
 * @example
 *     {
 *         tenant_id: "tenant_id",
 *         user_id: "user_id",
 *         version: 1,
 *         thought: "thought"
 *     }
 */
export interface GetUserSpecificsUserRequest {
    tenant_id: string;
    user_id: string;
    version: number;
    thought: string;
}
