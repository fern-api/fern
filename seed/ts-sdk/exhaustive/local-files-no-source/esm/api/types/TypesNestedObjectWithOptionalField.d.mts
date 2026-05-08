import type * as SeedApi from "../index.mjs";
export interface TypesNestedObjectWithOptionalField {
    string?: (string | null) | undefined;
    NestedObject?: SeedApi.TypesObjectWithOptionalField | undefined;
}
