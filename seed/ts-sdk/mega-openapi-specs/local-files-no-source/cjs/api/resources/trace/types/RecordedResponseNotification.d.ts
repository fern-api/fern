import type * as SeedApi from "../../../index.js";
export interface RecordedResponseNotification {
    submissionId: SeedApi.trace.SubmissionId;
    traceResponsesSize: number;
    testCaseId?: (string | null) | undefined;
}
