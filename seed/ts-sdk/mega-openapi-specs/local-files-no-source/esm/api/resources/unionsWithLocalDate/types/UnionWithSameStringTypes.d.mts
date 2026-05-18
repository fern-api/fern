import type * as SeedApi from "../../../index.mjs";
export type UnionWithSameStringTypes = SeedApi.unionsWithLocalDate.UnionWithSameStringTypes.CustomFormat | SeedApi.unionsWithLocalDate.UnionWithSameStringTypes.RegularString | SeedApi.unionsWithLocalDate.UnionWithSameStringTypes.PatternString;
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
