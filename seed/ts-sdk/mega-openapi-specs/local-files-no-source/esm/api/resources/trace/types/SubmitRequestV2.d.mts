import type * as SeedApi from "../../../index.mjs";
export interface SubmitRequestV2 {
    submissionId: SeedApi.trace.SubmissionId;
    language: SeedApi.trace.Language;
    submissionFiles: SeedApi.trace.SubmissionFileInfo[];
    problemId: SeedApi.trace.ProblemId;
    problemVersion?: (number | null) | undefined;
    userId?: (string | null) | undefined;
}
