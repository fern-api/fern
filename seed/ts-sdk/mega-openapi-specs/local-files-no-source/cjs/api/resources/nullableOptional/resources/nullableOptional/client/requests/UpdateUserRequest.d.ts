import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         userId: "userId"
 *     }
 */
export interface UpdateUserRequest {
    userId: string;
    username?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: SeedApi.nullableOptional.Address | null;
}
