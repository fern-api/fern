import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         username: "username"
 *     }
 */
export interface CreateUserRequest {
    username: string;
    email: string | null;
    phone?: string | null;
    address?: SeedApi.nullableOptional.Address | null;
}
