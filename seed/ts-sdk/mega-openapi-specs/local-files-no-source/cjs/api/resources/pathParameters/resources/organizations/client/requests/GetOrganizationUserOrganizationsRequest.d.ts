/**
 * @example
 *     {
 *         tenant_id: "tenant_id",
 *         organization_id: "organization_id",
 *         user_id: "user_id"
 *     }
 */
export interface GetOrganizationUserOrganizationsRequest {
    tenant_id: string;
    organization_id: string;
    user_id: string;
}
