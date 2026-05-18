import type * as SeedApi from "../../../index.mjs";
export interface FooExtended extends SeedApi.unionsWithLocalDate.Foo {
    age: number;
}
