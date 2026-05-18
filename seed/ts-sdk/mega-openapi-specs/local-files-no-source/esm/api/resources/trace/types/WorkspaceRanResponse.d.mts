import type * as SeedApi from "../../../index.mjs";
export interface WorkspaceRanResponse {
    submissionId: SeedApi.trace.SubmissionId;
    runDetails: SeedApi.trace.WorkspaceRunDetails;
}
