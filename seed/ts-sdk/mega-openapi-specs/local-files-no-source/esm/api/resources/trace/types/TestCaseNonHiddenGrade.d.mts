import type * as SeedApi from "../../../index.mjs";
export interface TestCaseNonHiddenGrade {
    passed: boolean;
    actualResult?: (SeedApi.trace.VariableValue | null) | undefined;
    exception?: (SeedApi.trace.ExceptionV2 | null) | undefined;
    stdout: string;
}
