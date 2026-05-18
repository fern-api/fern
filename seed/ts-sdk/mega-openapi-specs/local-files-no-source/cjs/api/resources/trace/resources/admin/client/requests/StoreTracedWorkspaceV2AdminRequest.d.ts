import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         submissionId: "submissionId",
 *         body: [{
 *                 submissionId: "submissionId",
 *                 lineNumber: 1,
 *                 file: {
 *                     filename: "filename",
 *                     directory: "directory"
 *                 },
 *                 stack: {
 *                     numStackFrames: 1
 *                 }
 *             }]
 *     }
 */
export interface StoreTracedWorkspaceV2AdminRequest {
    submissionId: SeedApi.trace.SubmissionId;
    body: SeedApi.trace.TraceResponseV2[];
}
