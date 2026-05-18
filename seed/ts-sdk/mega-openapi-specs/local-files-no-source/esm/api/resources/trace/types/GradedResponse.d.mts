import type * as SeedApi from "../../../index.mjs";
export interface GradedResponse {
    submissionId: SeedApi.trace.SubmissionId;
    testCases: Record<string, SeedApi.trace.TestCaseResultWithStdout>;
}
