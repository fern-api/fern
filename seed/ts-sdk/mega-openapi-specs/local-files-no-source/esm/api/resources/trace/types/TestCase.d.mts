import type * as SeedApi from "../../../index.mjs";
export interface TestCase {
    id: string;
    params: SeedApi.trace.VariableValue[];
}
