import type * as SeedApi from "../../../index.mjs";
export interface ListType {
    valueType: SeedApi.trace.VariableType;
    /** Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false. */
    isFixedLength?: (boolean | null) | undefined;
}
