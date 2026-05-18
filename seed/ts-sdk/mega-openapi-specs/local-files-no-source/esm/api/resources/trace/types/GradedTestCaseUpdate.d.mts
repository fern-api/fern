import type * as SeedApi from "../../../index.mjs";
export interface GradedTestCaseUpdate {
    testCaseId: SeedApi.trace.V2TestCaseId;
    grade: SeedApi.trace.TestCaseGrade;
}
