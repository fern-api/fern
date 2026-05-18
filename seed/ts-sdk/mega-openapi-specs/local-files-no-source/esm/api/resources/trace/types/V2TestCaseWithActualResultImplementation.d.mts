import type * as SeedApi from "../../../index.mjs";
export interface V2TestCaseWithActualResultImplementation {
    getActualResult: SeedApi.trace.V2NonVoidFunctionDefinition;
    assertCorrectnessCheck: SeedApi.trace.V2AssertCorrectnessCheck;
}
