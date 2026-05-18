import type * as SeedApi from "../../../index.mjs";
export type UnionWithPrimitive = SeedApi.unions.UnionWithPrimitive.Integer | SeedApi.unions.UnionWithPrimitive.String;
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
