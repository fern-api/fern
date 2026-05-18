import type * as SeedApi from "../../../index.js";
export interface FooExtended extends SeedApi.unionsWithLocalDate.Foo {
    age: number;
}
