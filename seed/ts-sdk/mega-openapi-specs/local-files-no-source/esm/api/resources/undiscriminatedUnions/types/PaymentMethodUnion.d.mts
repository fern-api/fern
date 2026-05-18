import type * as SeedApi from "../../../index.mjs";
/**
 * Tests that nested properties with camelCase wire names are properly
 * converted from snake_case Ruby keys when passed as Hash values.
 */
export type PaymentMethodUnion = SeedApi.undiscriminatedUnions.TokenizeCard | SeedApi.undiscriminatedUnions.ConvertToken;
