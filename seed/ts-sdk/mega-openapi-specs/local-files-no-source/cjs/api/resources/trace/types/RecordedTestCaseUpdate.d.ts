import type * as SeedApi from "../../../index.js";
export interface RecordedTestCaseUpdate {
    testCaseId: SeedApi.trace.V2TestCaseId;
    traceResponsesSize: number;
}
