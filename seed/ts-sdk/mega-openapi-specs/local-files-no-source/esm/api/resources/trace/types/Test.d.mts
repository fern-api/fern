import type * as SeedApi from "../../../index.mjs";
export type Test = SeedApi.trace.Test.And | SeedApi.trace.Test.Or;
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
