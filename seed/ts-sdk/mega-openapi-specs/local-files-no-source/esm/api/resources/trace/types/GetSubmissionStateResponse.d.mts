import type * as SeedApi from "../../../index.mjs";
export interface GetSubmissionStateResponse {
    timeSubmitted?: (string | null) | undefined;
    submission: string;
    language: SeedApi.trace.Language;
    submissionTypeState: SeedApi.trace.SubmissionTypeState;
}
