/**
 * @example
 *     {
 *         id: "id"
 *     }
 */
export interface GetUserRequest {
    /**
     * The user ID.
     * Can be in DOMAIN\username format for Windows users.
     */
    id: string;
    /**
     * The domain name.
     * Example: CORP\username or DOMAIN\user
     */
    domain?: string | null;
}
