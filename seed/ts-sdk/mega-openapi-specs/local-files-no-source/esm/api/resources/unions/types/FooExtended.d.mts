import type * as SeedApi from "../../../index.mjs";
export interface FooExtended extends SeedApi.unions.Foo {
    age: number;
}
