import type * as SeedApi from "../../../index.js";
/**
 * Request body for testing deserialization of null values
 */
export interface DeserializationTestRequest {
    requiredString: string;
    nullableString: string | null;
    optionalString?: (string | null) | undefined;
    optionalNullableString?: (string | null) | undefined;
    nullableEnum: SeedApi.nullableOptional.UserRole | null;
    optionalEnum?: (SeedApi.nullableOptional.UserStatus | null) | undefined;
    nullableUnion: SeedApi.nullableOptional.NotificationMethod | null;
    optionalUnion?: (SeedApi.nullableOptional.SearchResult | null) | undefined;
    nullableList: string[] | null;
    nullableMap: Record<string, number | null> | null;
    nullableObject: SeedApi.nullableOptional.Address | null;
    optionalObject?: (SeedApi.nullableOptional.Organization | null) | undefined;
}
