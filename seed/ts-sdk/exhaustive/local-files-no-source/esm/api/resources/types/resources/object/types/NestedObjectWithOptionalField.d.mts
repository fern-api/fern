import type * as SeedExhaustive from "../../../../../index.mjs";
export interface NestedObjectWithOptionalField {
    string?: string | undefined;
    NestedObject?: SeedExhaustive.types.ObjectWithOptionalField | undefined;
}
