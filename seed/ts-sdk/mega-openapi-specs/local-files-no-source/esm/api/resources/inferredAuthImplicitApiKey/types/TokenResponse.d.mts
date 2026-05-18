/**
 * An auth token response.
 */
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope?: (string | null) | undefined;
}
