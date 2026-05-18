import type * as SeedApi from "../../../index.js";
export interface TestCaseWithExpectedResult {
    testCase: SeedApi.trace.TestCase;
    expectedResult: SeedApi.trace.VariableValue;
}
