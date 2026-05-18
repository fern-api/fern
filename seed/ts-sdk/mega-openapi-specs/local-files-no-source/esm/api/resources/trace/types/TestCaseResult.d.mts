import type * as SeedApi from "../../../index.mjs";
export interface TestCaseResult {
    expectedResult: SeedApi.trace.VariableValue;
    actualResult: SeedApi.trace.ActualResult;
    passed: boolean;
}
