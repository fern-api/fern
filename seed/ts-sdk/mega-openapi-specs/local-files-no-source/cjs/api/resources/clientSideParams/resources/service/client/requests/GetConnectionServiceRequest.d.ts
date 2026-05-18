/**
 * @example
 *     {
 *         connectionId: "connectionId"
 *     }
 */
export interface GetConnectionServiceRequest {
    connectionId: string;
    /** Comma-separated list of fields to include */
    fields?: string | null;
}
