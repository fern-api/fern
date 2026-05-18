/**
 * @example
 *     {
 *         tenant_id: "tenant_id",
 *         organization_id: "organization_id"
 *     }
 */
export interface SearchOrganizationsOrganizationsRequest {
    tenant_id: string;
    organization_id: string;
    limit?: number | null;
}
