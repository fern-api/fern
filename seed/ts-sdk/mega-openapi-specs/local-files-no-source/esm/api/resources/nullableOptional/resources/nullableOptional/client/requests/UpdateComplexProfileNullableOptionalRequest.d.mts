import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         profileId: "profileId"
 *     }
 */
export interface UpdateComplexProfileNullableOptionalRequest {
    profileId: string;
    nullableRole?: SeedApi.nullableOptional.UserRole | null;
    nullableStatus?: SeedApi.nullableOptional.UserStatus | null;
    nullableNotification?: SeedApi.nullableOptional.NotificationMethod | null;
    nullableSearchResult?: SeedApi.nullableOptional.SearchResult | null;
    nullableArray?: string[] | null;
}
