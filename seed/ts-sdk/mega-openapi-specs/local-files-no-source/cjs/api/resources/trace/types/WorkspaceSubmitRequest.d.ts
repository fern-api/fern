import type * as SeedApi from "../../../index.js";
export interface WorkspaceSubmitRequest {
    submissionId: SeedApi.trace.SubmissionId;
    language: SeedApi.trace.Language;
    submissionFiles: SeedApi.trace.SubmissionFileInfo[];
    userId?: (string | null) | undefined;
}
