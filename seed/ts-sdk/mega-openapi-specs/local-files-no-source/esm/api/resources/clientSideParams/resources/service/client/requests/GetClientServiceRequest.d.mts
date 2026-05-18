/**
 * @example
 *     {
 *         clientId: "clientId"
 *     }
 */
export interface GetClientServiceRequest {
    clientId: string;
    /** Comma-separated list of fields to include */
    fields?: string | null;
    /** Whether specified fields are included or excluded */
    include_fields?: boolean | null;
}
