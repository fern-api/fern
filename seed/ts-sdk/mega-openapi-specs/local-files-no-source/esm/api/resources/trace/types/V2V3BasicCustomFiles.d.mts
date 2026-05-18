import type * as SeedApi from "../../../index.mjs";
export interface V2V3BasicCustomFiles {
    methodName: string;
    signature: SeedApi.trace.V2V3NonVoidFunctionSignature;
    additionalFiles: Record<string, SeedApi.trace.V2V3Files>;
    basicTestCaseTemplate: SeedApi.trace.V2V3BasicTestCaseTemplate;
}
