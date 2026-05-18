import type * as SeedApi from "../../../index.mjs";
export type UnionWithDuplicatePrimitive = SeedApi.unionsWithLocalDate.UnionWithDuplicatePrimitive.Integer1 | SeedApi.unionsWithLocalDate.UnionWithDuplicatePrimitive.Integer2 | SeedApi.unionsWithLocalDate.UnionWithDuplicatePrimitive.String1 | SeedApi.unionsWithLocalDate.UnionWithDuplicatePrimitive.String2;
export declare namespace UnionWithDuplicatePrimitive {
    interface Integer1 {
        type: "integer1";
        value?: number | undefined;
    }
    interface Integer2 {
        type: "integer2";
        value?: number | undefined;
    }
    interface String1 {
        type: "string1";
        value?: string | undefined;
    }
    interface String2 {
        type: "string2";
        value?: string | undefined;
    }
}
