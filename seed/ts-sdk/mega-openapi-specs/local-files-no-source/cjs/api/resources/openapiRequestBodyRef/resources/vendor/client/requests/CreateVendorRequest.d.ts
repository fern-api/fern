/**
 * @example
 *     {
 *         name: "name"
 *     }
 */
export interface CreateVendorRequest {
    idempotency_key?: string;
    name: string;
    address?: string;
}
