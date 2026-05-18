import type * as SeedApi from "../../../index.mjs";
export interface RunningResponse {
    submissionId: SeedApi.trace.SubmissionId;
    state: SeedApi.trace.RunningSubmissionState;
}
