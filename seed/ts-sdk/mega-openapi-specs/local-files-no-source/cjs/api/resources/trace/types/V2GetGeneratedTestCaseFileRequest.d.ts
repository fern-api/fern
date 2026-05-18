import type * as SeedApi from "../../../index.js";
export interface V2GetGeneratedTestCaseFileRequest {
    template?: (SeedApi.trace.V2TestCaseTemplate | null) | undefined;
    testCase: SeedApi.trace.V2TestCaseV2;
}
