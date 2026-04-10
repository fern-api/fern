import type * as SeedApi from "../index.js";
export interface TypesNestedObjectWithOptionalField {
    string?: (string | null) | undefined;
    NestedObject?: SeedApi.TypesObjectWithOptionalField | undefined;
}
