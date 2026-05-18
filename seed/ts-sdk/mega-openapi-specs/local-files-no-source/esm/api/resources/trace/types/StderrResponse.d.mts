import type * as SeedApi from "../../../index.mjs";
export interface StderrResponse {
    submissionId: SeedApi.trace.SubmissionId;
    stderr: string;
}
