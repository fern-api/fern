import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         role: "ADMIN"
 *     }
 */
export interface FilterByRoleNullableOptionalRequest {
    role: SeedApi.nullableOptional.UserRole | null;
    status?: SeedApi.nullableOptional.UserStatus | null;
    secondaryRole?: SeedApi.nullableOptional.UserRole | null;
}
