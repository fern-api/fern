import type * as SeedApi from "../../../index.mjs";
export type UnionWithNullableReference = SeedApi.unions.UnionWithNullableReference.Foo | SeedApi.unions.UnionWithNullableReference.Bar;
export declare namespace UnionWithNullableReference {
    interface Foo {
        type: "foo";
        value?: (SeedApi.unions.Foo | null) | undefined;
    }
    interface Bar {
        type: "bar";
        value?: (SeedApi.unions.Bar | null) | undefined;
    }
}
