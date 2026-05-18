import type * as SeedApi from "../../../index.mjs";
export interface CreateProblemRequest {
    problemName: string;
    problemDescription: SeedApi.trace.ProblemDescription;
    files: Record<string, SeedApi.trace.ProblemFiles>;
    inputParams: SeedApi.trace.VariableTypeAndName[];
    outputType: SeedApi.trace.VariableType;
    testcases: SeedApi.trace.TestCaseWithExpectedResult[];
    methodName: string;
}
