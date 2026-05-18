import type * as SeedApi from "../../../index.mjs";
export interface TraceResponse {
    submissionId: SeedApi.trace.SubmissionId;
    lineNumber: number;
    returnValue?: (SeedApi.trace.DebugVariableValue | null) | undefined;
    expressionLocation?: (SeedApi.trace.ExpressionLocation | null) | undefined;
    stack: SeedApi.trace.StackInformation;
    stdout?: (string | null) | undefined;
}
