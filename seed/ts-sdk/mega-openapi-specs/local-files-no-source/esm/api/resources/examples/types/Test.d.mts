import type * as SeedApi from "../../../index.mjs";
export type Test = SeedApi.examples.Test.And | SeedApi.examples.Test.Or;
export declare namespace Test {
    interface And {
        type: "and";
        value?: boolean | undefined;
    }
    interface Or {
        type: "or";
        value?: boolean | undefined;
    }
}
