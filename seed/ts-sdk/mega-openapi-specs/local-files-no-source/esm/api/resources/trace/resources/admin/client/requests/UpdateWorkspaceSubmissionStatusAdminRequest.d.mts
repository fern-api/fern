import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         submissionId: "submissionId",
 *         body: {
 *             type: "stopped"
 *         }
 *     }
 */
export interface UpdateWorkspaceSubmissionStatusAdminRequest {
    submissionId: SeedApi.trace.SubmissionId;
    body: SeedApi.trace.WorkspaceSubmissionStatus;
}
