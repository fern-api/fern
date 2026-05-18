/**
 * @example
 *     {}
 */
export interface GetUsersNullableRequest {
    usernames?: (string | null) | (string | null)[];
    avatar?: string | null;
    activated?: (boolean | null) | (boolean | null)[];
    tags?: (string | null) | (string | null)[];
    extra?: boolean | null;
}
