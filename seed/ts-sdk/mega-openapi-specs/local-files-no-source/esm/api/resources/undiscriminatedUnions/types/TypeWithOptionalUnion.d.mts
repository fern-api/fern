import type * as SeedApi from "../../../index.mjs";
export interface TypeWithOptionalUnion {
    myUnion?: (SeedApi.undiscriminatedUnions.MyUnion | null) | undefined;
}
