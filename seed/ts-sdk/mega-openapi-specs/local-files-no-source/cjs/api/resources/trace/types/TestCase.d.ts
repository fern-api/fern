import type * as SeedApi from "../../../index.js";
export interface TestCase {
    id: string;
    params: SeedApi.trace.VariableValue[];
}
