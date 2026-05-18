import type * as SeedApi from "../../../index.js";
export type UnionWithPrimitive = SeedApi.unionsWithLocalDate.UnionWithPrimitive.Integer | SeedApi.unionsWithLocalDate.UnionWithPrimitive.String;
export declare namespace UnionWithPrimitive {
    interface Integer {
        type: "integer";
        value?: number | undefined;
    }
    interface String {
        type: "string";
        value?: string | undefined;
    }
}
