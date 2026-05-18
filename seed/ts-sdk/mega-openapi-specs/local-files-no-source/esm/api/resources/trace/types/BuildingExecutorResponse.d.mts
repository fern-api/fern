import type * as SeedApi from "../../../index.mjs";
export interface BuildingExecutorResponse {
    submissionId: SeedApi.trace.SubmissionId;
    status: SeedApi.trace.ExecutionSessionStatus;
}
