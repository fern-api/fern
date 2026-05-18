import type * as SeedApi from "../../../../../../index.mjs";
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
export interface SendTestSubmissionUpdateAdminRequest {
    submissionId: SeedApi.trace.SubmissionId;
    body: SeedApi.trace.TestSubmissionUpdate;
}
