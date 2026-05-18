import type * as SeedApi from "../../../index.js";
export type UnionWithDiscriminant = SeedApi.unions.UnionWithDiscriminant.Foo | SeedApi.unions.UnionWithDiscriminant.Bar;
export declare namespace UnionWithDiscriminant {
    interface Foo {
        _type: "foo";
        foo?: SeedApi.unions.Foo | undefined;
    }
    interface Bar {
        _type: "bar";
        bar?: SeedApi.unions.Bar | undefined;
    }
}
