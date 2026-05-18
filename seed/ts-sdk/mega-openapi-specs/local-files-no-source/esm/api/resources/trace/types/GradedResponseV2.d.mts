import type * as SeedApi from "../../../index.mjs";
export interface GradedResponseV2 {
    submissionId: SeedApi.trace.SubmissionId;
    testCases: Record<string, SeedApi.trace.TestCaseGrade>;
}
