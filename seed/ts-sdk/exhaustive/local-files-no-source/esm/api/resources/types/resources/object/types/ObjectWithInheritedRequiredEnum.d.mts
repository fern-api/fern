import type * as SeedExhaustive from "../../../../../index.mjs";
/**
 * A base object that has a required enum field, preventing Default derive
 * in Rust because enums don't implement Default.
 */
export interface ObjectWithInheritedRequiredEnum {
    requiredEnum: SeedExhaustive.types.WeatherReport;
    requiredString: string;
}
