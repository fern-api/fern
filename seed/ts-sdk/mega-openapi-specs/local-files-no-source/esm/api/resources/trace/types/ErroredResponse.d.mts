import type * as SeedApi from "../../../index.mjs";
export interface ErroredResponse {
    submissionId: SeedApi.trace.SubmissionId;
    errorInfo: SeedApi.trace.ErrorInfo;
}
