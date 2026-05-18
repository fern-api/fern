import type * as SeedApi from "../../../index.js";
export type UnionWithDiscriminant = SeedApi.unionsWithLocalDate.UnionWithDiscriminant.Foo | SeedApi.unionsWithLocalDate.UnionWithDiscriminant.Bar;
export declare namespace UnionWithDiscriminant {
    interface Foo {
        _type: "foo";
        foo?: SeedApi.unionsWithLocalDate.Foo | undefined;
    }
    interface Bar {
        _type: "bar";
        bar?: SeedApi.unionsWithLocalDate.Bar | undefined;
    }
}
