import type * as SeedApi from "../../../index.js";
export type UnionWithSameStringTypes = SeedApi.unions.UnionWithSameStringTypes.CustomFormat | SeedApi.unions.UnionWithSameStringTypes.RegularString | SeedApi.unions.UnionWithSameStringTypes.PatternString;
export declare namespace UnionWithSameStringTypes {
    interface CustomFormat {
        type: "customFormat";
        value?: string | undefined;
    }
    interface RegularString {
        type: "regularString";
        value?: string | undefined;
    }
    interface PatternString {
        type: "patternString";
        value?: string | undefined;
    }
}
