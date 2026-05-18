import type * as SeedApi from "../../../index.js";
export interface GradedResponseV2 {
    submissionId: SeedApi.trace.SubmissionId;
    testCases: Record<string, SeedApi.trace.TestCaseGrade>;
}
