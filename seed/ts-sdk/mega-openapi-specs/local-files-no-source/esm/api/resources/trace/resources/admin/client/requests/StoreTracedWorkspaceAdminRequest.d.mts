import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         submissionId: "submissionId",
 *         workspaceRunDetails: {
 *             stdout: "stdout"
 *         },
 *         traceResponses: [{
 *                 submissionId: "submissionId",
 *                 lineNumber: 1,
 *                 stack: {
 *                     numStackFrames: 1
 *                 }
 *             }]
 *     }
 */
export interface StoreTracedWorkspaceAdminRequest {
    submissionId: SeedApi.trace.SubmissionId;
    workspaceRunDetails: SeedApi.trace.WorkspaceRunDetails;
    traceResponses: SeedApi.trace.TraceResponse[];
}
