import type * as SeedApi from "../../../index.mjs";
export interface V2Parameter {
    parameterId: SeedApi.trace.V2ParameterId;
    name: string;
    variableType: SeedApi.trace.VariableType;
}
