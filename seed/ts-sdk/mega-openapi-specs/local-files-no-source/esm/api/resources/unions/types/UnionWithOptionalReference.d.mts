import type * as SeedApi from "../../../index.mjs";
export type UnionWithOptionalReference = SeedApi.unions.UnionWithOptionalReference.Foo | SeedApi.unions.UnionWithOptionalReference.Bar;
export declare namespace UnionWithOptionalReference {
    interface Foo {
        type: "foo";
        value?: (SeedApi.unions.Foo | null) | undefined;
    }
    interface Bar {
        type: "bar";
        value?: (SeedApi.unions.Bar | null) | undefined;
    }
}
