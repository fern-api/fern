import type * as SeedApi from "../../../index.js";
export interface TypeWithOptionalUnion {
    myUnion?: (SeedApi.undiscriminatedUnions.MyUnion | null) | undefined;
}
