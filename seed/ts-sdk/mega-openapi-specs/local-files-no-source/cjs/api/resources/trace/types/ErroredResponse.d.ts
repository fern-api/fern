import type * as SeedApi from "../../../index.js";
export interface ErroredResponse {
    submissionId: SeedApi.trace.SubmissionId;
    errorInfo: SeedApi.trace.ErrorInfo;
}
