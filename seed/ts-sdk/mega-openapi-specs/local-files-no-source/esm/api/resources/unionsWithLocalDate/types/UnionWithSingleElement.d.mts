import type * as SeedApi from "../../../index.mjs";
export interface UnionWithSingleElement extends SeedApi.unionsWithLocalDate.Foo {
    type: UnionWithSingleElement.Type;
}
export declare namespace UnionWithSingleElement {
    const Type: {
        readonly Foo: "foo";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
