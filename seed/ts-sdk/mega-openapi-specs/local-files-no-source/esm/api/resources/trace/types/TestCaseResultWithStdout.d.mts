import type * as SeedApi from "../../../index.mjs";
export interface TestCaseResultWithStdout {
    result: SeedApi.trace.TestCaseResult;
    stdout: string;
}
