import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         submissionId: "submissionId",
 *         testCaseId: "testCaseId",
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
export interface StoreTracedTestCaseV2AdminRequest {
    submissionId: SeedApi.trace.SubmissionId;
    testCaseId: SeedApi.trace.V2TestCaseId;
    body: SeedApi.trace.TraceResponseV2[];
}
