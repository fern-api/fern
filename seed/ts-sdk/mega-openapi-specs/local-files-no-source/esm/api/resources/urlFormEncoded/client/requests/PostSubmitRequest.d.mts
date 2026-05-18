/**
 * @example
 *     {
 *         username: "johndoe",
 *         email: "john@example.com"
 *     }
 */
export interface PostSubmitRequest {
    /** The user's username */
    username: string;
    /** The user's email address */
    email: string;
}
