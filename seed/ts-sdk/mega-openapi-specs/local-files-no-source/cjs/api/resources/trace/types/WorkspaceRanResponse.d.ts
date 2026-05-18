import type * as SeedApi from "../../../index.js";
export interface WorkspaceRanResponse {
    submissionId: SeedApi.trace.SubmissionId;
    runDetails: SeedApi.trace.WorkspaceRunDetails;
}
