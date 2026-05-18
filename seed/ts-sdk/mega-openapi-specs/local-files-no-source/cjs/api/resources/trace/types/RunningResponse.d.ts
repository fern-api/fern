import type * as SeedApi from "../../../index.js";
export interface RunningResponse {
    submissionId: SeedApi.trace.SubmissionId;
    state: SeedApi.trace.RunningSubmissionState;
}
