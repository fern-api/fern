import type * as SeedApi from "../../../index.js";
export interface InvalidRequestResponse {
    request: SeedApi.trace.SubmissionRequest;
    cause: SeedApi.trace.InvalidRequestCause;
}
