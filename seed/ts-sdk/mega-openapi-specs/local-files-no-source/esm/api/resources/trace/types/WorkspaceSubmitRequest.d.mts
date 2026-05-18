import type * as SeedApi from "../../../index.mjs";
export interface WorkspaceSubmitRequest {
    submissionId: SeedApi.trace.SubmissionId;
    language: SeedApi.trace.Language;
    submissionFiles: SeedApi.trace.SubmissionFileInfo[];
    userId?: (string | null) | undefined;
}
