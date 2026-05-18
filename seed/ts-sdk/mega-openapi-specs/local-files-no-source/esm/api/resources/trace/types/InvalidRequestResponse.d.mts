import type * as SeedApi from "../../../index.mjs";
export interface InvalidRequestResponse {
    request: SeedApi.trace.SubmissionRequest;
    cause: SeedApi.trace.InvalidRequestCause;
}
