import type * as SeedApi from "../../../index.mjs";
export interface TestSubmissionState {
    problemId: SeedApi.trace.ProblemId;
    defaultTestCases: SeedApi.trace.TestCase[];
    customTestCases: SeedApi.trace.TestCase[];
    status: SeedApi.trace.TestSubmissionStatus;
}
