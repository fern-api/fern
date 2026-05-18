export interface Identity {
    connection: string;
    user_id: string;
    provider: string;
    is_social: boolean;
    access_token?: (string | null) | undefined;
    expires_in?: (number | null) | undefined;
}
