import type * as SeedApi from "../../../index.js";
export interface TestCaseResult {
    expectedResult: SeedApi.trace.VariableValue;
    actualResult: SeedApi.trace.ActualResult;
    passed: boolean;
}
