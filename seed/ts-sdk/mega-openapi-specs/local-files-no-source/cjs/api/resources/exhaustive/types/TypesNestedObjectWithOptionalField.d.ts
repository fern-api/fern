import type * as SeedApi from "../../../index.js";
export interface TypesNestedObjectWithOptionalField {
    string?: (string | null) | undefined;
    NestedObject?: (SeedApi.exhaustive.TypesObjectWithOptionalField | null) | undefined;
}
