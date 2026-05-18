import type * as SeedApi from "../../../index.mjs";
export interface TraceResponseV2 {
    submissionId: SeedApi.trace.SubmissionId;
    lineNumber: number;
    file: SeedApi.trace.TracedFile;
    returnValue?: (SeedApi.trace.DebugVariableValue | null) | undefined;
    expressionLocation?: (SeedApi.trace.ExpressionLocation | null) | undefined;
    stack: SeedApi.trace.StackInformation;
    stdout?: (string | null) | undefined;
}
