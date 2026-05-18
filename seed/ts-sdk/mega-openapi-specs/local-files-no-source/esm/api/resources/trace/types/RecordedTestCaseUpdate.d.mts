import type * as SeedApi from "../../../index.mjs";
export interface RecordedTestCaseUpdate {
    testCaseId: SeedApi.trace.V2TestCaseId;
    traceResponsesSize: number;
}
