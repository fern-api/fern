/**
 * @example
 *     {}
 */
export interface ListConnectionsServiceRequest {
    /** Filter by strategy type (e.g., auth0, google-oauth2, samlp) */
    strategy?: string | null;
    /** Filter by connection name */
    name?: string | null;
    /** Comma-separated list of fields to include */
    fields?: string | null;
}
