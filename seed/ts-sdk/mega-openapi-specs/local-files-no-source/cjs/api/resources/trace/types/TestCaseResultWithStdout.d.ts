import type * as SeedApi from "../../../index.js";
export interface TestCaseResultWithStdout {
    result: SeedApi.trace.TestCaseResult;
    stdout: string;
}
