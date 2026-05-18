import type * as SeedApi from "../../../index.js";
export interface BuildingExecutorResponse {
    submissionId: SeedApi.trace.SubmissionId;
    status: SeedApi.trace.ExecutionSessionStatus;
}
