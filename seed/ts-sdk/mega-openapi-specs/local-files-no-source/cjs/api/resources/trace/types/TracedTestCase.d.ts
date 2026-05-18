import type * as SeedApi from "../../../index.js";
export interface TracedTestCase {
    result: SeedApi.trace.TestCaseResultWithStdout;
    traceResponsesSize: number;
}
