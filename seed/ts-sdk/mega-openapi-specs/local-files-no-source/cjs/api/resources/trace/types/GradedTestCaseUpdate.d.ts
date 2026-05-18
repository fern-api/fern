import type * as SeedApi from "../../../index.js";
export interface GradedTestCaseUpdate {
    testCaseId: SeedApi.trace.V2TestCaseId;
    grade: SeedApi.trace.TestCaseGrade;
}
