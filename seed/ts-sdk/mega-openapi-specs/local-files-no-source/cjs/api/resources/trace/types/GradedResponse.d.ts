import type * as SeedApi from "../../../index.js";
export interface GradedResponse {
    submissionId: SeedApi.trace.SubmissionId;
    testCases: Record<string, SeedApi.trace.TestCaseResultWithStdout>;
}
