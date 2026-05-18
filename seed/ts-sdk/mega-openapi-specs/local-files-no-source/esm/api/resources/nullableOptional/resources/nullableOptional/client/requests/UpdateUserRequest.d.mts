import type * as SeedApi from "../../../../../../index.mjs";
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
