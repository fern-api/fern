import type * as SeedApi from "../../../index.js";
export interface V2V3GetGeneratedTestCaseFileRequest {
    template?: (SeedApi.trace.V2V3TestCaseTemplate | null) | undefined;
    testCase: SeedApi.trace.V2V3TestCaseV2;
}
