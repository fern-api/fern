/**
 * An OAuth token response.
 */
export interface AuthTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: (string | null) | undefined;
}
