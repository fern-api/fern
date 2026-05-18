import type * as SeedApi from "../../../index.mjs";
export interface RecordingResponseNotification {
    submissionId: SeedApi.trace.SubmissionId;
    testCaseId?: (string | null) | undefined;
    lineNumber: number;
    lightweightStackInfo: SeedApi.trace.LightweightStackframeInformation;
    tracedFile?: (SeedApi.trace.TracedFile | null) | undefined;
}
