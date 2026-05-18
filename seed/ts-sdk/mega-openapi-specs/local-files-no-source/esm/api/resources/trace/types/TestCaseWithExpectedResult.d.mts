import type * as SeedApi from "../../../index.mjs";
export interface TestCaseWithExpectedResult {
    testCase: SeedApi.trace.TestCase;
    expectedResult: SeedApi.trace.VariableValue;
}
