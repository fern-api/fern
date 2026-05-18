import type * as SeedApi from "../../../index.js";
export interface V2BasicCustomFiles {
    methodName: string;
    signature: SeedApi.trace.V2NonVoidFunctionSignature;
    additionalFiles: Record<string, SeedApi.trace.V2Files>;
    basicTestCaseTemplate: SeedApi.trace.V2BasicTestCaseTemplate;
}
