import type * as SeedApi from "../../../index.js";
export interface UnionWithSingleElement extends SeedApi.unions.Foo {
    type: UnionWithSingleElement.Type;
}
export declare namespace UnionWithSingleElement {
    const Type: {
        readonly Foo: "foo";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
