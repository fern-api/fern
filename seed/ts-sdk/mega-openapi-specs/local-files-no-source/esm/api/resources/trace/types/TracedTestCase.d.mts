import type * as SeedApi from "../../../index.mjs";
export interface TracedTestCase {
    result: SeedApi.trace.TestCaseResultWithStdout;
    traceResponsesSize: number;
}
