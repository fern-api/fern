import type * as SeedApi from "../../../index.mjs";
export type ActualResult = {
    type: "value";
    value?: SeedApi.trace.VariableValue | undefined;
} | {
    type: "exception";
} | {
    type: "exceptionV2";
    value?: SeedApi.trace.ExceptionV2 | undefined;
};
