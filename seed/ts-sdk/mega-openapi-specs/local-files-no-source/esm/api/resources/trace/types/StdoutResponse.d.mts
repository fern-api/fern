import type * as SeedApi from "../../../index.mjs";
export interface StdoutResponse {
    submissionId: SeedApi.trace.SubmissionId;
    stdout: string;
}
