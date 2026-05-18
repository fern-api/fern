import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         submissionId: "submissionId",
 *         body: {
 *             updateTime: "2024-01-15T09:30:00Z",
 *             updateInfo: {
 *                 type: "running"
 *             }
 *         }
 *     }
 */
export interface SendWorkspaceSubmissionUpdateAdminRequest {
    submissionId: SeedApi.trace.SubmissionId;
    body: SeedApi.trace.WorkspaceSubmissionUpdate;
}
