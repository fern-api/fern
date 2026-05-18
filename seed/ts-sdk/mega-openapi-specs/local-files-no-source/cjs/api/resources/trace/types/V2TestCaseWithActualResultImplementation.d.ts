import type * as SeedApi from "../../../index.js";
export interface V2TestCaseWithActualResultImplementation {
    getActualResult: SeedApi.trace.V2NonVoidFunctionDefinition;
    assertCorrectnessCheck: SeedApi.trace.V2AssertCorrectnessCheck;
}
