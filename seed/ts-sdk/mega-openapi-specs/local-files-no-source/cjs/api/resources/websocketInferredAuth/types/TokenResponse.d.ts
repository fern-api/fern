/**
 * An OAuth token response.
 */
export interface TokenResponse {
    access_token: string;
    refresh_token?: (string | null) | undefined;
}
