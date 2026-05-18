import type * as SeedApi from "../../../index.mjs";
/**
 * This is a simple union.
 */
export type Union = SeedApi.unionsWithLocalDate.Union.Foo | SeedApi.unionsWithLocalDate.Union.Bar;
export declare namespace Union {
    interface Foo {
        type: "foo";
        foo?: SeedApi.unionsWithLocalDate.Foo | undefined;
    }
    interface Bar {
        type: "bar";
        bar?: SeedApi.unionsWithLocalDate.Bar | undefined;
    }
}
