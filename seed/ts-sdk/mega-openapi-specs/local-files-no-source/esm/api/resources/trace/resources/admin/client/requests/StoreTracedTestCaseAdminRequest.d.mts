import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         submissionId: "submissionId",
 *         testCaseId: "testCaseId",
 *         result: {
 *             result: {
 *                 expectedResult: {
 *                     type: "integerValue"
 *                 },
 *                 actualResult: {
 *                     type: "value"
 *                 },
 *                 passed: true
 *             },
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
export interface StoreTracedTestCaseAdminRequest {
    submissionId: SeedApi.trace.SubmissionId;
    testCaseId: string;
    result: SeedApi.trace.TestCaseResultWithStdout;
    traceResponses: SeedApi.trace.TraceResponse[];
}
