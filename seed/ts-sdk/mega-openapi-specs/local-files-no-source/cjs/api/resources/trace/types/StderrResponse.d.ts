import type * as SeedApi from "../../../index.js";
export interface StderrResponse {
    submissionId: SeedApi.trace.SubmissionId;
    stderr: string;
}
