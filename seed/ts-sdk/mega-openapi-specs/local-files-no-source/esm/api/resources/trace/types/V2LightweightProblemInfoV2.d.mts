import type * as SeedApi from "../../../index.mjs";
export interface V2LightweightProblemInfoV2 {
    problemId: SeedApi.trace.ProblemId;
    problemName: string;
    problemVersion: number;
    variableTypes: SeedApi.trace.VariableType[];
}
