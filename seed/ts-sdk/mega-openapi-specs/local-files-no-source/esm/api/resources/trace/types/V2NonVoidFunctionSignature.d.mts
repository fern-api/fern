import type * as SeedApi from "../../../index.mjs";
export interface V2NonVoidFunctionSignature {
    parameters: SeedApi.trace.V2Parameter[];
    returnType: SeedApi.trace.VariableType;
}
