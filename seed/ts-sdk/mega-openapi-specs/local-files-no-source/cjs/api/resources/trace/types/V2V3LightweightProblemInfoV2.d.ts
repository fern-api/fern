import type * as SeedApi from "../../../index.js";
export interface V2V3LightweightProblemInfoV2 {
    problemId: SeedApi.trace.ProblemId;
    problemName: string;
    problemVersion: number;
    variableTypes: SeedApi.trace.VariableType[];
}
