import type * as SeedApi from "../../../index.mjs";
export interface RecordedResponseNotification {
    submissionId: SeedApi.trace.SubmissionId;
    traceResponsesSize: number;
    testCaseId?: (string | null) | undefined;
}
