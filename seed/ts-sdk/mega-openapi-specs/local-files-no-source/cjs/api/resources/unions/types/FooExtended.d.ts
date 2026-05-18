import type * as SeedApi from "../../../index.js";
export interface FooExtended extends SeedApi.unions.Foo {
    age: number;
}
