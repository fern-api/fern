import type * as SeedApi from "../../../index.js";
export interface V2V3TestCaseWithActualResultImplementation {
    getActualResult: SeedApi.trace.V2V3NonVoidFunctionDefinition;
    assertCorrectnessCheck: SeedApi.trace.V2V3AssertCorrectnessCheck;
}
