import type * as SeedApi from "../../../index.mjs";
/**
 * Nested object for testing
 */
export interface Address {
    street: string;
    city: string | null;
    state?: (string | null) | undefined;
    zipCode: string;
    country?: (string | null) | undefined;
    buildingId: SeedApi.nullableOptional.NullableUserId | null;
    tenantId: SeedApi.nullableOptional.OptionalUserId | null;
}
