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
export interface UpdateTestSubmissionStatusAdminRequest {
    submissionId: SeedApi.trace.SubmissionId;
    body: SeedApi.trace.TestSubmissionStatus;
}
