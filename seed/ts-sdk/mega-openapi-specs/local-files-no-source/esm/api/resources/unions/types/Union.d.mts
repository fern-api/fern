import type * as SeedApi from "../../../index.mjs";
/**
 * This is a simple union.
 */
export type Union = SeedApi.unions.Union.Foo | SeedApi.unions.Union.Bar;
export declare namespace Union {
    interface Foo {
        type: "foo";
        foo?: SeedApi.unions.Foo | undefined;
    }
    interface Bar {
        type: "bar";
        bar?: SeedApi.unions.Bar | undefined;
    }
}
