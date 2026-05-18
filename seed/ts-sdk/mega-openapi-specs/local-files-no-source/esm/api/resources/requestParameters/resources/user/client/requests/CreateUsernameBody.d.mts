/**
 * @example
 *     {
 *         tags: ["tags"],
 *         username: "username",
 *         password: "password",
 *         name: "name"
 *     }
 */
export interface CreateUsernameBody {
    tags?: string | string[];
    username: string;
    password: string;
    name: string;
}
