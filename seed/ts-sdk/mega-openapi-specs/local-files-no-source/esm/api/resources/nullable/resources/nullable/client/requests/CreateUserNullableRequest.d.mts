import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         username: "username"
 *     }
 */
export interface CreateUserNullableRequest {
    username: string;
    tags?: string[] | null;
    metadata?: SeedApi.nullable.Metadata | null;
    avatar?: string | null;
}
